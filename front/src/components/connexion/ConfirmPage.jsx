import { useParams } from "react-router-dom";
import { fetchData } from "../../services/ws-services";
function ConfirmPage() {
  const { email } = useParams();
  fetchData(`/confirm/${email}`).then((data) => {
    if (data.error) {
      alert(data.error);
      return;
    }
  });

  return (
    <div
      className="backdrop-blur-sm p-8 rounded-2xl border-2 shadow-lg w-[60%]
          dark:bg-gradient-to-br dark:from-gray-800/50 dark:to-gray-900/50 dark:border-cyan-400 
          bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-yellow-400 m-8"
    >
      <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent dark:bg-gradient-to-r dark:from-cyan-400 dark:to-blue-600 bg-gradient-to-r from-yellow-400 to-yellow-600">
        Email Confirmation Successful
      </h1>
      <p className="text-2xl text-center dark:text-cyan-400 text-yellow-400 mt-4 mb-8">
        Thank you for confirming your email address.
      </p>
      <p className="text-xl text-center dark:text-cyan-400 text-yellow-400">
        You can now
        <a
          className="ms-2 text-cyan-400 hover:underline dark:text-yellow-400 dark:hover:text-yellow-600
        "
          href="/auth"
        >
          login
        </a>
        .
      </p>
    </div>
  );
}

export default ConfirmPage;
