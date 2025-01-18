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
    <div className="p-8  text-center">
      <h1 className="text-2xl font-bold mb-4">Email confirmation successful</h1>
      <p className="text-gray-700">
        Thank you for confirming your email address.
      </p>
      <p className="mt-4">
        You can now{" "}
        <a className="font-bold text-blue-500" href="/auth">
          login
        </a>
        .
      </p>
    </div>
  );
}

export default ConfirmPage;
