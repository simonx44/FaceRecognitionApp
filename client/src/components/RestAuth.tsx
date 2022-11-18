import ImageSource from "../components/ImageSource";
import {
  Alert,
  Button,
  Container,
  Flex,
  Loader,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useMutation } from "react-query";
import { recognitonService } from "@/service/RecognitionService";
import { AxiosError, AxiosResponse } from "axios";
import { IApiError } from "@/types";
import { showNotification } from "@mantine/notifications";
import { useState } from "react";
import { IconCheck, IconFaceIdError, IconArrowsLeftRight } from "@tabler/icons";
import { IPropertybag, ISuccessAuthResponse } from "../types";
import UserInfo from "@/components/UserInfo";

const RestAuthComponent = () => {
  const [img, setImg] = useState<string>();
  const [imageMode, updateImageMode] = useState(true);

  const authMutation = useMutation(
    (img: string) => {
      updateImageMode(false);
      return recognitonService.authenticate(img);
    },
    {
      onError: (error: AxiosError) => {
        console.log(error);
        const data = error.response?.data as IApiError;
        const msg = data?.body?.errorMessage ?? error.message;
        showErrorMessage(msg ?? "An error occured");
      },
      onSuccess: (data: AxiosResponse<ISuccessAuthResponse>) => {},
    }
  );

  const showErrorMessage = (message: string) => {
    showNotification({
      title: "Something went wrong",
      message: message,
      color: "red",
      className: "my-notification-class",
      autoClose: 5000,
    });
  };

  const initAuthenticate = (img: string) => {
    setImg(img);

    authMutation.mutate(img);
  };

  const getErrorMessage = (err: AxiosError) => {
    const data = err.response?.data as IApiError;
    const msg = data?.body?.errorMessage ?? err.message;

    return msg ?? "No reason available";
  };

  return (
    <Container className="flex  flex-col items-stretch  h-[70vh]">
      <Flex justify="center" mt="md">
        <Text className="text-center" size="lg">
          Rest (Request - Response)
        </Text>
        <IconArrowsLeftRight />
      </Flex>

      {!imageMode && authMutation.isLoading && (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader size={50} />
          <Text> Please wait a moment ...</Text>
        </div>
      )}

      {!imageMode && authMutation.isError && (
        <div className="flex flex-col justify-center items-center  gap-3 mt-5">
          <ThemeIcon variant="gradient" radius="xl" color="red" size={80}>
            <IconFaceIdError size={80} />
          </ThemeIcon>

          <Text> Unfortunately the authentication failed</Text>

          <Alert
            className="w-1/2 my-5"
            icon={<IconFaceIdError size={16} />}
            title="Reason:"
            color="red"
          >
            {getErrorMessage(authMutation.error)}
          </Alert>

          <Button
            variant="outline"
            className="mt-6"
            onClick={() => updateImageMode(true)}
          >
            {" "}
            Try to again
          </Button>
        </div>
      )}

      {!imageMode && authMutation.data && (
        <div className="flex flex-col justify-center items-center gap-3">
          <ThemeIcon variant="gradient" radius="xl" size={80} className="my-4">
            <IconCheck size={80} />
          </ThemeIcon>
          <Text> The registration was successful</Text>
          <Text size="sm"> User info:</Text>
          <div className="min-w-full">
            <UserInfo userData={authMutation.data.data.body.userInfo} />
          </div>
        </div>
      )}

      {imageMode && <ImageSource onImageUpload={initAuthenticate} />}
    </Container>
  );
};

export default RestAuthComponent;
