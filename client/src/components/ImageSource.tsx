import {
  Text,
  Tabs,
  Button,
  Loader,
  FileInput,
  Group,
  Image,
  TextInput,
} from "@mantine/core";
import Webcam from "react-webcam";
import {
  IconExternalLink,
  IconDeviceComputerCamera,
  IconUpload,
  IconPhoto,
  IconX,
} from "@tabler/icons";
import { showNotification } from "@mantine/notifications";
import {
  Dropzone,
  DropzoneProps,
  FileWithPath,
  IMAGE_MIME_TYPE,
} from "@mantine/dropzone";
import { useEffect, useRef, useState } from "react";

interface IImageSourceProps {
  onImageUpload: (img: string) => void;
}

export default function ImageSource({ onImageUpload }: IImageSourceProps) {
  const webcamRef = useRef<Webcam>(null);

  const [webcamLoading, updateWebcamLoading] = useState(true);

  const capture = () => {
    if (!webcamRef.current) return;
    const img = webcamRef.current.getScreenshot();

    if (img) {
      onImageUpload(img);
    }
  };

  const onFileUpload = (files: FileWithPath[]) => {
    const file = files[0];

    if (!file) {
      showError("File not found");
    }

    var reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = function () {
      const fileAsBase64 = reader.result as string;
      onImageUpload(fileAsBase64);
    };
    reader.onerror = function (error) {
      console.log("Error: ", error);
    };
  };

  const showError = (message: string) => {
    showNotification({
      title: "Something went wrong",
      message: message,
      color: "red",
      icon: <IconX />,
      className: "my-notification-class",
    });
  };

  const handleDropzoneError = (
    files: Parameters<Exclude<DropzoneProps["onReject"], undefined>>[0]
  ) => {
    showError(files[0].errors[0].message);
  };

  const onWebcamAvailable = (e: any) => {
    updateWebcamLoading(false);
  };

  return (
    <div>
      <Tabs defaultValue="webcam" className="mt-10">
        <Tabs.List>
          <Tabs.Tab
            className="w-1/2"
            value="webcam"
            icon={<IconDeviceComputerCamera size={20} />}
          >
            Use your webcam
          </Tabs.Tab>
          <Tabs.Tab
            className="w-1/2"
            value="input"
            icon={<IconPhoto size={20} />}
          >
            Upload image
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="webcam" pt="xs">
          <div className="flex flex-col items-center">
            {webcamLoading && (
              <div className="my-16 flex flex-col items-center gap-5">
                <Loader size="xl" />
                <Text size="xs">
                  Trying to connect to your webcam. Make sure your camera is
                  connected
                </Text>
              </div>
            )}
            <Webcam
              muted={true}
              ref={webcamRef}
              onUserMedia={onWebcamAvailable}
              screenshotFormat="image/jpeg"
              className={webcamLoading ? "hidden" : "my-5"}
            ></Webcam>

            <Button fullWidth variant="outline" onClick={capture}>
              Capture photo
            </Button>
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="input" pt="xs">
          <Dropzone
            className="mt-5"
            onDrop={onFileUpload}
            onReject={handleDropzoneError}
            maxSize={3 * 1024 ** 2}
            accept={IMAGE_MIME_TYPE}
            multiple={false}
          >
            <Group
              position="center"
              spacing="xl"
              style={{ minHeight: 220, pointerEvents: "none" }}
            >
              <Dropzone.Accept>
                <IconUpload size={50} stroke={1.5} />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX size={50} stroke={1.5} />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconPhoto size={50} stroke={1.5} />
              </Dropzone.Idle>

              <div>
                <Text size="xl" inline>
                  Drag image here or click to select file
                </Text>
                <Text size="sm" color="dimmed" inline mt={7}>
                  Attach one image of your face
                </Text>
              </div>
            </Group>
          </Dropzone>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
