import { gql, useMutation } from "@apollo/client";
import { POST_FIELDS } from "../fragments/post";
import { useAppDispatch } from "../store";
import { addPosts } from "../slices/postSlice";
import { Preferences } from "@capacitor/preferences";
import { DEVICE_ID_KEY } from "../constants";
import { MEMBERSHIP_FIELDS } from "../fragments/membership";
import { addMemberships } from "../slices/membershipSlice";


const CREATE_POST = gql`
  mutation CreatePost($deviceId: Int, $channelId: Int!, $text: String!) {
    createPost(deviceId: $deviceId, channelId: $channelId, text: $text) {
      post {
        ...PostFields
      }
      membership {
        ...MembershipFields
      }
    }
  }
  ${POST_FIELDS}
  ${MEMBERSHIP_FIELDS}
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
      dispatch(addMemberships([data.createPost.membership]))

      onComleted();
    },
  });

  const createPost = async (channelId: number, text: string) => {
    const { value } = await Preferences.get({
      key: DEVICE_ID_KEY,
    }); 

    console.log('deviceId', value);

    create({
      variables: {
        deviceId: value
          ? parseInt(value)
          : null,
        channelId,
        text,
      }
    });
  }

  return createPost;
}

export default useCreatePost;