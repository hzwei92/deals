import { gql, useMutation } from "@apollo/client";
import { POST_FIELDS } from "../fragments/post";
import { useAppDispatch } from "../store";
import { addPosts } from "../slices/postSlice";
import { Preferences } from "@capacitor/preferences";


const CREATE_POST = gql`
  mutation CreatePost($deviceId: Int, $channelId: Int!, $text: String!) {
    createPost(deviceId: $deviceId, channelId: $channelId, text: $text) {
      ...PostFields
    }
  }
  ${POST_FIELDS}
`;

const useCreatePost = (onComleted: () => void) => {
  const dispatch = useAppDispatch();

  const [create] = useMutation(CREATE_POST, {
    onError: err => {
      console.log(err);
      onComleted();
    },
    onCompleted: data => {
      console.log(data);

      dispatch(addPosts([data.createPost]))

      onComleted();
    },
  });

  const createPost = async (channelId: number, text: string) => {
    const deviceId = (await Preferences.get({
      key: 'deviceId',
    })).value;

    create({
      variables: {
        deviceId,
        channelId,
        text,
      }
    });
  }

  return createPost;
}

export default useCreatePost;