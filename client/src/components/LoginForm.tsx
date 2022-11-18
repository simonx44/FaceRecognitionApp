import { Group, TextInput, Button, Image, NumberInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import { IUserFormInput } from "../types";

interface IProps {
  image?: string;
  onSubmit: (userData: IUserFormInput) => void;
  userData?: IUserFormInput;
}

export default function LoginForm({ image, userData, onSubmit }: IProps) {
  const form = useForm<IUserFormInput>({
    initialValues: {
      fName: "",
      lName: "",
      age: undefined,
      userid: "",
    },

    validate: {
      fName: (value: string) =>
        value.length < 2 ? "First name must have at least 2 letters" : null,
      lName: (value: string) =>
        value.length < 2 ? "Last name must have at least 2 letters" : null,
      age: (value: number) => (!value ? "No age provided" : null),
      userid: (value: string) =>
        value.length < 4 ? "Userid must have at least 6 letters" : null,
    },
  });

  const register = (values: IUserFormInput) => {
    form.validate();
    if (form.isValid()) {
      onSubmit(values);
    }
  };

  useEffect(() => {
    if (userData) form.setValues(userData);
  }, [userData]);

  return (
    <Group className="w-2/3 flex flex-col">
      <div style={{ width: 240, marginLeft: "auto", marginRight: "auto" }}>
        <Image radius="md" src={image ?? ""} alt="Your image" />
      </div>
      <form
        onSubmit={form.onSubmit(register)}
        className="w-full flex flex-col gap-4"
      >
        <TextInput
          className="w-full"
          placeholder="Userid"
          label="Userid"
          withAsterisk
          {...form.getInputProps("userid")}
        />
        <TextInput
          className="w-full"
          placeholder="Fist name"
          label="Fist name"
          withAsterisk
          {...form.getInputProps("fName")}
        />
        <TextInput
          className="w-full"
          placeholder="Last name"
          label="Last name"
          withAsterisk
          {...form.getInputProps("lName")}
        />
        <NumberInput
          className="w-full"
          placeholder="Age"
          label="Age"
          withAsterisk
          {...form.getInputProps("age")}
        />

        <Button fullWidth variant="outline" type="submit">
          Register
        </Button>
      </form>
    </Group>
  );
}
