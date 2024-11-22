import { Button, Alert } from "antd";

const ErrorPage = ({ description, onRetry }) => {
  return (
    <div className="flex justify-center items-center bg-gray-100">
      <Alert
        message="Something went wrong!"
        description={description}
        type="error"
        showIcon
        action={
          <Button size="small" type="link" onClick={onRetry}>
            Retry
          </Button>
        }
        className="mb-4"
      />
    </div>
  );
};

export default ErrorPage;
