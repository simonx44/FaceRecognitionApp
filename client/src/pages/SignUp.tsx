import { Container, Text, ActionIcon, Loader, ThemeIcon } from "@mantine/core";
import { Stepper, Button, Group } from "@mantine/core";
import LoginForm from "../components/LoginForm";
import { showNotification } from "@mantine/notifications";
import ImageSource from "../components/ImageSource";
import { IconArrowBack, IconCheck } from "@tabler/icons";
import { useState } from "react";
import { recognitonService } from "../service/RecognitionService";
import { useMutation } from "react-query";
import { IApiError, IHttpRequest, IUserFormInput } from "@/types";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

const SignUpFrom = () => {
  const navigate = useNavigate();
  const [img, setImage] = useState<string>();
  const [userData, updateUserData] = useState<IUserFormInput>();
  const [active, setActive] = useState<number>(0);
  const nextStep = (current: number) => {
    setActive((current: number) => (current < 3 ? current + 1 : current));
  };
  const prevStep = () =>
    setActive((current: number) => (current > 0 ? current - 1 : current));

  const updateImage = (url: string) => {
    setImage(url);
    nextStep(1);
  };

  const registerMutation = useMutation(
    (data: any) => {
      return recognitonService.register(data.img, data.user);
    },
    {
      onError: (error: AxiosError) => {
        console.log(error);
        const data = error.response?.data as IApiError;
        const msg = data?.body?.errorMessage;
        showErrorMessage(msg ?? "An error occured");
        prevStep();
      },
      onSuccess: (data: any) => {
        nextStep(active);
      },
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

  const handleNextStep = (step: number) => {
    if (active === 2 || active === 3) return;
    if (step <= active) {
      setActive(step);
    } else if (active === 0 && img && step === 1) {
      setActive(1);
    } else {
      showErrorMessage("Finish current step to proceed");
    }
  };

  const registerUser = (userData: IUserFormInput) => {
    if (!img || !userData) {
      showErrorMessage("User data or imaga not provided");
    }

    updateUserData(userData);
    nextStep(active);
    registerMutation.mutate({ img: img, user: userData });
  };

  return (
    <Container className="flex justify-center flex-col">
      <Text size="xl" className="text-center">
        {" "}
        Sign up
      </Text>

      <Stepper
        active={active}
        onStepClick={handleNextStep}
        breakpoint="sm"
        className="my-12"
      >
        <Stepper.Step label="First step" description="Image upload">
          <ImageSource onImageUpload={updateImage} />
        </Stepper.Step>
        <Stepper.Step label="Second step" description="Enter user information">
          <Group position="center" mt="xl">
            <LoginForm
              userData={userData}
              onSubmit={registerUser}
              image={img}
            ></LoginForm>
          </Group>
        </Stepper.Step>
        <Stepper.Step
          label="Complete registration"
          description="Get full access"
        >
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader size={50} />
            <Text> Please wait a moment ...</Text>
          </div>
        </Stepper.Step>
        <Stepper.Completed>
          <div className="flex flex-col justify-center items-center h-80 gap-3">
            <ThemeIcon variant="gradient" radius="xl" size={80}>
              <IconCheck size={80} />
            </ThemeIcon>

            <Text> The registration was successful</Text>

            <Button
              variant="outline"
              className="mt-6"
              onClick={() => navigate("/auth")}
            >
              Try to authenticate
            </Button>
          </div>
        </Stepper.Completed>
      </Stepper>
      {active === 0 ||
        (active === 1 && (
          <div className="flex flex-row justify-end">
            <ActionIcon variant="outline" color="primary" onClick={prevStep}>
              <IconArrowBack />
            </ActionIcon>
          </div>
        ))}
    </Container>
  );
};

export default SignUpFrom;
