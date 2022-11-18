import ImageSource from "../components/ImageSource";
import { Container, Select, Text } from "@mantine/core";
import RestAuthComponent from "@/components/RestAuth";
import { useState } from "react";
import S3AuthComponent from "../components/S3AuthComponent";

const AuthenticatePage = () => {
  const [value, setValue] = useState<string | null>("0");

  return (
    <Container className="flex  flex-col items-stretch  h-[70vh]">
      <Text className="text-center" size="xl">
        {" "}
        Authenticate with your face
      </Text>
      <Select
        my={12}
        className="self-center"
        label="Select the type of authentication process"
        data={[
          { value: "0", label: "REST" },
          { value: "1", label: "Event (S3 Bucket -> SMS)" },
        ]}
        value={value}
        onChange={setValue}
      />

      {value === "0" ? <RestAuthComponent /> : <S3AuthComponent />}
    </Container>
  );
};

export default AuthenticatePage;
