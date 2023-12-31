const fs = require("fs");
const path = require("path");
const Cipher = require("../models/Cipher");
const User = require("../models/User");
const History = require("../models/History");
const validator = require("validator");

// @desc    gets saved cipher's file
// @route   GET /api/v1/admin/cipher/file/:cipherName
// @access  private (admin only)
const getCipherFile = async (req, res) => {
  let cipherName = req.params.cipherName.toLowerCase();

  const cipherExists = await Cipher.findOne({ cipherName });
  if (!cipherExists) {
    res.status(404);
    throw new Error(`${cipherName} does not exist!`);
  }
  try {
    const fileExists = fs.existsSync(cipherExists.filePath);
    if (!fileExists) {
      res.status(404);
      throw new Error("unable to find cipher file!");
    }
    const filename = `${cipherName}.py`;
    const filePath = path.join(__dirname, "../uploads", filename);
    const file = await fs.promises.readFile(filePath);

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    res.send(file);
  } catch (error) {
    res.status(500);
    throw new Error(error);
  }
};

// @desc    creates a cipher file and add its information
// @route   POST /api/v1/admin/cipher/create
// @access  private (admin only)
const createCipher = async (req, res) => {
  let { cipherName, cipherDescription, keysDescription, keyType, keyArgs } =
    req.body;

  cipherName = cipherName.toLowerCase();
  if (!cipherName) {
    res.status(400);
    throw new Error("cipher name must be provided!");
  } else if (!req.file) {
    res.status(400);
    throw new Error("cipher file must be provided!");
  } else if (!keyType) {
    res.status(400);
    throw new Error("a valid key-type must be provided!");
  } else if (keyType !== "no-key" && !keyArgs) {
    res.status(400);
    throw new Error("valid key-args must be provided!");
  } else {
    const cipherExists = await Cipher.findOne({ cipherName });

    if (cipherExists) {
      res.status(400);
      throw new Error(`${cipherName} cipher already exists!`);
    }

    const newCipher = {
      cipherName,
      keyType,
      keyArgs,
      cipherDescription,
      keysDescription,
      filePath: req.file.path,
    };

    await Cipher.create(newCipher);
    res.status(201).json({ msg: `${cipherName} cipher added!` });
  }
};

// @desc    updates existing cipher resource
// @route   PATCH /api/v1/admin/cipher/update/:cipher
// @access  private (admin only)
const updateCipher = async (req, res) => {
  let { cipher } = req.params;
  let { cipherName, cipherDescription, keysDescription, keyType, keyArgs } =
    req.body;

  cipherName = cipherName.toLowerCase();

  if (!keyType) {
    res.status(400);
    throw new Error("a valid key-type must be provided!");
  } else if (!cipherName) {
    res.status(400);
    throw new Error("cipher name must be provided!");
  } else if (keyType !== "no-key" && !keyArgs) {
    res.status(400);
    throw new Error("valid key-args must be provided!");
  } else {
    const modifedCipher = {
      cipherName,
      keyType,
      keyArgs,
      cipherDescription,
      keysDescription,
    };

    if (req.file) {
      modifedCipher.filePath = req.file.path;
    }

    const cipherUpdated = await Cipher.findOneAndUpdate(
      { cipherName: cipher },
      modifedCipher
    );

    if (!cipherUpdated) {
      res.status(404);
      throw new Error(`${cipherName} cipher does not exist!`);
    }

    res.status(200).json({ msg: `${cipherName} cipher updated!` });
  }
};

// @desc    removes existing cipher file from disk and db
// @route   DELETE /api/v1/admin/cipher/delete/:cipherName
// @access  private (admin only)
const removeCipher = async (req, res) => {
  let { cipherName } = req.params;
  cipherName = cipherName.toLowerCase();

  const cipherExists = await Cipher.findOne({ cipherName });
  if (!cipherExists) {
    res.status(404);
    throw new Error(`${cipherName} does not exist!`);
  }
  try {
    const fileExists = fs.existsSync(cipherExists.filePath);

    if (fileExists) {
      await fs.promises.unlink(cipherExists.filePath);
    }

    await Cipher.findOneAndDelete({ cipherName });
    res.status(200).json({ msg: `${cipherName} removed!` });
  } catch (error) {
    res.status(500);
    throw new Error(error);
  }
};

// @desc    gets all existing users
// @route   GET /api/v1/admin/users
// @access  private (admin only)
const getUsers = async (req, res) => {
  const users = await User.find();
  res.json({ count: users.length, users });
};

// @desc    adds a new user
// @route   POST /api/v1/admin/user/create
// @access  private (admin only)
const addUser = async (req, res) => {
  let { email, password, role } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and Password must be provided!");
  } else if (!validator.isEmail(email)) {
    res.status(400);
    throw new Error("Please provide a valid email!");
  } else if (!role) {
    res.status(400);
    throw new Error("Please provide a valid user role!");
  } else if (await User.findOne({ email })) {
    res.status(400);
    throw new Error(`User with ${email} email already exists!`);
  }

  await User.create({ email, password, role });
  res.status(201).json({ msg: "User added!" });
};

// @desc    removes registered user account
// @route   DELETE /api/v1/admin/user/delete/:email
// @access  private (admin only)
const removeUser = async (req, res) => {
  const { email } = req.params;

  const userExists = await User.findOne({ email });
  if (!userExists) {
    res.status(404);
    throw new Error(`User with ${email} email does not exist!`);
  } else if (userExists.email === process.env.ROOT_ADMIN_EMAIL) {
    res.status(403);
    throw new Error("Action not allowed!");
  }
  try {
    await User.findOneAndDelete({ email });
    await History.deleteMany({ userId: userExists._id });
    res.status(200).json({ msg: `User with ${email} email removed!` });
  } catch (error) {
    res.status(500);
    throw new Error(error);
  }
};

// @desc    updates registerd user's information
// @route   PATCH /api/v1/admin/user/update/:userEmail
// @access  private (admin only)
const updateUser = async (req, res) => {
  let { userEmail } = req.params;
  let { email, role, password } = req.body;

  if (!email || !validator.isEmail(email)) {
    res.status(400);
    throw new Error("Please provide a valid email!");
  } else if (!role) {
    res.status(400);
    throw new Error("Please provide a valid user role!");
  } else {
    const userExists = await User.findOne({ email: userEmail });
    if (userExists.email === process.env.ROOT_ADMIN_EMAIL) {
      res.status(403);
      throw new Error(`Action not allowed!`);
    }
    try {
      if (password) {
        userExists.email = email;
        userExists.role = role;
        userExists.password = password;
        await userExists.save();
      } else {
        await User.findOneAndUpdate({ email: userEmail }, { email, role });
      }

      res.status(200).json({ msg: "User data updated!" });
    } catch (error) {
      res.status(500);
      throw new Error(error);
    }
  }
};

module.exports = {
  createCipher,
  updateCipher,
  removeCipher,
  getUsers,
  addUser,
  removeUser,
  updateUser,
  getCipherFile,
};
