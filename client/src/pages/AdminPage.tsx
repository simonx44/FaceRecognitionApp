import { Alert, Container, Flex, Loader, Text } from "@mantine/core";
import { IconFaceIdError } from "@tabler/icons";
import { useState } from "react";
import { useQueries, useQuery } from "react-query";
import UserInfo from "../components/UserInfo";
import { recognitonService } from "../service/RecognitionService";
import { IUser } from "../types";

export default function AdminPage() {
  const [users, updateUsers] = useState<Array<IUser>>();

  const { data, status } = useQuery(
    "getAllUser",
    () => recognitonService.getAllUser(),
    {
      onSuccess: (data) => {
        updateUsers(data.data.body.users);
      },
    }
  );

  const handleDelete = (userId: string) => {
    if (!users) return;

    const filtered = users.filter(
      (user) => user.property_bag.userid !== userId
    );

    updateUsers(filtered);
  };

  return (
    <Container>
      <Text size="xl" className="text-center">
        All registered user:
      </Text>

      <div className="mt-5">
        {status === "error" && (
          <Alert
            className="w-1/2 my-5"
            icon={<IconFaceIdError size={16} />}
            title="An error occured"
            color="red"
            children={undefined}
          ></Alert>
        )}
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader size={50} />
            <Text> Please wait a moment ...</Text>
          </div>
        )}
        {status === "success" && (
          <div>
            {users && users.length > 0 ? (
              <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-4">
                {users.map((user) => (
                  <UserInfo
                    userData={user}
                    onUserDelete={handleDelete}
                    key={user.PK}
                  />
                ))}
              </div>
            ) : (
              <Flex justify="center" align="center">
                <Text> No data found</Text>
              </Flex>
            )}
          </div>
        )}
      </div>
    </Container>
  );
}
