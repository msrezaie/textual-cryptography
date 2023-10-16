import { useAppContext } from "../context/appContext";

const UserSettings = () => {
  const { userName } = useAppContext();
  return (
    <>
      <article>
        <div className="grid">
          <div className="container">
            <label>
              <strong>Email</strong>
            </label>
            <input disabled value={userName} />
          </div>
        </div>
        <button>Update</button>
        <button>Forgot Password?</button>
      </article>
    </>
  );
};
export default UserSettings;
