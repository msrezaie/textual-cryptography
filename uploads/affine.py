import sys
import json

def encrypt(text, key):
    try:
        key = json.loads(key)
        a = int(key['key1'])
        b = int(key['key2'])
        encrypted = []      # Initialize an empty list to store encrypted characters.
        for char in text:   # Loop through each character in the input text.
            if char.isalpha():  # Check if the character is a letter.
                base = ord('A') if char.isupper() else ord('a')   # Set the base value based on whether the letter is uppercase or lowercase.
                # Encrypt the character using the affine cipher formula and append the result to the 'encrypted' list.
                encrypted.append(chr((a * (ord(char) - base) + b) % 26 + base))
            else:
                encrypted.append(char)  # If the character is not a letter, append it to the 'encrypted' list as is.
        return ''.join(encrypted)   # Join the characters in the 'encrypted' list into a string and return it as the output.
    except ValueError:
        return "Error!"  # If the 'a' or 'b' key cannot be converted to an integer, return an error message.


def decrypt(text, key):
    try:
        key = json.loads(key)
        a = int(key['key1'])
        b = int(key['key2'])
        decrypted = []
        x = [ i for i in range(26) if (a * i) % 26 == 1 ] or [0]  # Calculate the modular inverse of 'a'.
        for char in text:
            if char.isalpha():
                base = ord('A') if char.isupper() else ord('a')
                # Decrypt the character using the affine cipher formula and append the result to the 'decrypted' list.
                decrypted.append(chr((x[0] * ((ord(char) - base) - b)) % 26 + base))
            else:
                decrypted.append(char)
        return ''.join(decrypted)
    except ValueError:
        return "Error!"
    
if len(sys.argv) < 4:
    print("Usage: python <operation> <arg1> <arg2>")
    sys.exit(1)

operation = sys.argv[1]
message = sys.argv[2]
keys = sys.argv[3]

if operation == "encrypt":
    result = encrypt(message, keys)
elif operation == "decrypt":
    result = decrypt(message, keys)
else:
    print("Invalid operation")
    sys.exit(1)

print(result)