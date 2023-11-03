import { useEffect } from "react";
import useGetChannelPosts from "../hooks/useGetChannelPosts";
import { selectFocusChannel } from "../slices/channelSlice";
import { selectPostsByChannelId } from "../slices/postSlice";
import { selectAppUser } from "../slices/userSlice";
import { useAppSelector } from "../store";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";


const extensions = [
  StarterKit.configure({
    history: {
      depth: 100,
    },
  }),
]

const content = ''

interface ChannelPopupTextProps {
}

const ChannelPopupText: React.FC<ChannelPopupTextProps> = ({  }) => {
  const user = useAppSelector(selectAppUser);
  const channel = useAppSelector(selectFocusChannel);

  const posts = useAppSelector(state => selectPostsByChannelId(state, channel?.id ?? -1));

  const getChannelPosts = useGetChannelPosts();

  const editor = useEditor({
    extensions,
    content,
  });

  useEffect(() => {
    if (!channel?.id) return;
    getChannelPosts(channel.id);
  }, [channel?.id]);

  return (
    <div style={{
      fontSize: 14,
    }}>
      <div>
        {
          posts
            .sort((a, b) => a.createdAt < b.createdAt ? -1 : 1)
            .map(post => {
              return (
                <div>
                  {
                    post.text
                  }  
                </div>
              )
            })
        }
      </div>
      <div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default ChannelPopupText;