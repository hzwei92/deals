import { gql, useMutation } from "@apollo/client";
import { POST_FIELDS } from "../fragments/post";
import { useAppDispatch } from "../store";
import { addPosts } from "../slices/postSlice";


const CREATE_POST = gql`
  mutation CreatePost($channelId: Int!, $text: String!) {
    createPost(channelId: $channelId, text: $text) {
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

  const createPost = (channelId: number, text: string) => {
    create({
      variables: {
        channelId,
        text,
      }
    });
  }

  return createPost;
}

export default useCreatePost;