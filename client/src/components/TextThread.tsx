import { IonButton, IonButtons, IonContent, IonInfiniteScroll, IonItem, IonList } from "@ionic/react";
import { Channel } from "../types/Channel";

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import History from "@tiptap/extension-history";
import { useAppSelector } from "../store";
import { selectPostsByChannelId } from "../slices/postSlice";
import { useEffect, useState } from "react";
import useCreatePost from "../hooks/useCreatePost";
import useGetChannelPosts from "../hooks/useGetChannelPosts";

// define your extension array
const extensions = [
  StarterKit.configure({
    history: {
      depth: 100,
    },
  }),
]

const content = ''
interface TextThreadProps {
  channel: Channel;
}
const TextThread: React.FC<TextThreadProps> = ({ channel }) => {
  const posts = useAppSelector(state => selectPostsByChannelId(state, channel.id));
  
  const [note, setNote] = useState('');

  const editor = useEditor({
    extensions,
    content,
  });

  const handleComplete = (message?: string) => {
    editor?.commands.clearContent();
    editor?.setEditable(true);
    if (message) {
      setNote(message);
      setTimeout(() => {
        setNote('');
      }, 3000);
    }
  }

  const createPost = useCreatePost(handleComplete);

  const handleSend = () => {
    if (!channel || !editor) return;
    editor.setEditable(false);
    createPost(channel.id, editor.getText());
  }

  const getPosts = useGetChannelPosts();

  useEffect(() => {
    if (!channel) return;
    getPosts(channel.id);
  }, []);

  const handleScroll = () => {
    if (!channel) return;
    getPosts(channel.id);
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontSize: 20,
    }}>
      <IonContent style={{
        height: '100%',
      }}>
        <IonInfiniteScroll position="top" onIonInfinite={handleScroll}/>
        <IonList style={{
          display: 'flex',
          flexDirection: 'column-reverse',
          height: '100%',
        }}>
          {
            posts.slice()
              .sort((a, b) => a.createdAt > b.createdAt ? -1 : 1)
              .map((post) => {
                return (
                  <IonItem key={post.id}>
                    { post.text }
                  </IonItem>
                )
              })
          }
        </IonList>
      </IonContent>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
      }}>
        <div style={{
          width: 'calc(100% - 85px)',
          border: '1px solid',
          borderRadius: 5,
          margin: 10,
        }}>
          <EditorContent editor={editor} />
        </div>
        <div style={{
          display: !!note ? 'flex' : 'none', 
          alignItems: 'center',
        }}>
          { note }
        </div>
        <IonButtons style={{
          marginRight: 5,
        }}>
          <IonButton onClick={handleSend} style={{
            border: '1px solid',
            borderRadius: 5,
          }}>
            SEND
          </IonButton>
        </IonButtons>
      </div>
    </div>
  );

}

export default TextThread