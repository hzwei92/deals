import { gql, useMutation } from "@apollo/client"
import { USER_FIELDS } from "../fragments/user";
import { useAppDispatch } from "../store";
import { addUsers } from "../slices/userSlice";


const CHANGE_USER_NAME = gql`
  mutation ChangeName($name: String!) {
    changeName(name: $name) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

const useChangeName = () => {
  const dispatch = useAppDispatch();

  const [change] = useMutation(CHANGE_USER_NAME, {
    onError: err => {
      console.log(err);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(addUsers([data.changeName]))
    },
  });

  const changeName = (name: string) => {
    change({
      variables: {
        name,
      }
    });
  }

  return changeName;
}

export default useChangeName