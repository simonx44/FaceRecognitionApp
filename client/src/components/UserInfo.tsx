import { Button, Image, Paper, Text, ThemeIcon } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconX } from "@tabler/icons";
import { AxiosResponse } from "axios";
import { useState } from "react";
import { useMutation } from "react-query";
import { recognitonService } from "../service/RecognitionService";
import {
  IPropertybag,
  ISuccessAuthResponse,
  ISuccessUsersReponse,
  IUser,
} from "../types";

const UserInfo = ({
  userData,
  isDeletable = true,
  onUserDelete,
}: {
  userData?: IUser;
  onUserDelete: (userId: string) => void;
  isDeletable?: boolean;
}) => {
  const properties = userData?.property_bag;
  const userId = properties?.userid;

  const deleteRequest = useMutation(
    (userId: string) => recognitonService.deleteUser(userId),
    {
      onSuccess: (data: AxiosResponse<ISuccessUsersReponse>) => {
        console.log(data);

        onUserDelete(userId ?? "");
      },

      onError: (data: any) => {
        console.log(data.response.data.body);
        showError("User could not be deleted");
      },
    }
  );

  const showError = (message: string) => {
    showNotification({
      title: "Something went wrong",
      message: message,
      color: "red",
      icon: <IconX />,
      className: "my-notification-class",
    });
  };

  return (
    <div className="">
      {userData ? (
        <Paper shadow="sm" className="">
          <Image
            height={200}
            radius="md"
            fit="cover"
            src={userData.imgUrl}
            alt="Your image"
          />

          {properties && Object.keys(properties).length === 0 && (
            <Text className="my-5">No user info found</Text>
          )}
          {properties &&
            Object.keys(properties).map((el) => {
              const value = properties[el as keyof IPropertybag];
              return (
                <div
                  className="flex flex-row justify-between py-3 px-4"
                  key={el}
                >
                  <Text>{el}:</Text>
                  <Text>{value}</Text>
                </div>
              );
            })}
          {isDeletable && (
            <div className="py-3 px-4">
              <Button
                fullWidth
                variant="outline"
                type="submit"
                loading={deleteRequest.isLoading}
                onClick={() => deleteRequest.mutate(userId ?? "")}
              >
                Delete User
              </Button>
            </div>
          )}
        </Paper>
      ) : (
        <Text size="sm" className="my-5 text-center">
          No user info found
        </Text>
      )}
    </div>
  );
};

export default UserInfo;
