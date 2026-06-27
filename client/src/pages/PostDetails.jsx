import { useParams } from "react-router-dom";

function PostDetails() {
  const { id } = useParams();

  return (
    <div className="page">
      <h1>Post Details</h1>
      <p>Viewing post ID: {id}</p>
      <p>Post details and claim requests will be implemented later.</p>
    </div>
  );
}

export default PostDetails;
