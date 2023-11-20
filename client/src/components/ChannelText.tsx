import { useEffect, useRef, useState } from "react";
import useGetChannelPosts from "../hooks/useGetChannelPosts";
import { selectFocusChannel } from "../slices/channelSlice";
import { selectPostsByChannelId } from "../slices/postSlice";
import { selectAppUser, selectUsers } from "../slices/userSlice";
import { useAppSelector } from "../store";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import { IonAvatar, IonButton, IonButtons, IonCard, IonIcon, IonLoading, IonSpinner } from "@ionic/react";
import md5 from "md5";
import { sendOutline } from "ionicons/icons";
import useCreatePost from "../hooks/useCreatePost";
import { keymap } from "@tiptap/pm/keymap";
import { Extension } from "@tiptap/core";


const extensions = [
  StarterKit.configure({
    history: {
      depth: 100,
    },
  }),
]

const content = ''

interface ChannelPopupTextProps {
  isPopup?: boolean;
}

const ChannelPopupText: React.FC<ChannelPopupTextProps> = ({ isPopup }) => {
  const user = useAppSelector(selectAppUser);
  const channel = useAppSelector(selectFocusChannel);

  const posts = useAppSelector(state => selectPostsByChannelId(state, channel?.id ?? -1));

  const users = useAppSelector(selectUsers);

  const getChannelPosts = useGetChannelPosts();

  const [shouldCreate, setShouldCreate] = useState(true);

  useEffect(() => {
    if (shouldCreate) {
      setShouldCreate(false);
      if (!channel || !editor) return;
      editor?.setEditable(false);
      createPost(channel.id, editor.getText());
    }
  }, [shouldCreate]);

  const CustomExtension = Extension.create({
    name: 'custom',
    addKeyboardShortcuts() {
      return {
        'Enter': () => {
          setShouldCreate(true);
          return true;
        },
      }
    },
  });

  extensions.push(CustomExtension);

  const editor = useEditor({
    extensions,
    content,
  });

  const [note, setNote] = useState('');

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

  const [shouldGetPosts, setShouldGetPosts] = useState(true);
  useEffect(() => {
    if (!channel?.id) return;
    if (!shouldGetPosts) return;

    const createdAt = posts.reduce((acc, post) => {
      if (!acc) return post.createdAt;
      if (post.createdAt < acc) return post.createdAt;
      return acc;
    }, posts[0]?.createdAt);

    getChannelPosts(channel.id, createdAt);

    setShouldGetPosts(false);
  }, [channel?.id, shouldGetPosts]);

  const containerRef = useRef<HTMLDivElement>(null);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);
  useEffect(() => {
    if (!containerRef.current) return;
    setPrevScrollHeight(containerRef.current.scrollHeight);
    if (isAtBottom) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'auto',
      });
    }
    else {
      if (containerRef.current.scrollHeight > prevScrollHeight) {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight - prevScrollHeight + containerRef.current.scrollTop,
        });
      }
    }
  }, [containerRef.current?.scrollHeight, isAtBottom])


  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current?.scrollTop === (containerRef.current?.scrollHeight ?? 0) - (containerRef.current?.offsetHeight ?? 0)) {
        console.log('scrolled to bottom')
        setIsAtBottom(true)
      }
      else {
        if (containerRef.current?.scrollTop === 0) {
          setShouldGetPosts(true);
        }
        setIsAtBottom(false)
      }
    };

    containerRef.current?.addEventListener('scroll', handleScroll);

    return () => {
      containerRef.current?.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef.current]);

  return (
    <div style={{
      fontSize: 14,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'end',  
      height: '100%',
    }}>
      <div ref={containerRef} style={{
        height: '100%',
        overflowY: 'scroll',
      }}>
        <div style={{
          display: shouldGetPosts ? 'flex' : 'none',
          padding: 20,
        }}>
          <IonSpinner />
        </div>

        {
          posts
            .sort((a, b) => a.createdAt < b.createdAt ? -1 : 1)
            .map(post => {
              return (
                <IonCard key={post.id} style={{
                  margin: 5,
                  padding: 10,
                }}>
                  <div style={{
                    display: 'flex',
                    marginBottom: 5,
                  }}>
                    <IonAvatar style={{
                      width: 20,
                      height: 20,
                      marginRight: 5,
                    }}>
                      <img src={`https://www.gravatar.com/avatar/${md5(users[post.userId]?.email ?? '')}?d=retro`} />
                    </IonAvatar>
                    {
                      users[post.userId]?.name
                    }
                  </div>
                  <div style={{
                    color: 'var(--ion-color-dark)'
                  }}>
                    {
                      post.text
                    }  
                  </div>
                </IonCard>
              )
            })
        }
      </div>
      <div style={{
        margin: 10,
        border: '1px solid',
        borderRadius: 5,
        display: 'flex',
      }}>
        <div style={{
          minWidth: isPopup ? 150 : 320,
        }}>
          <EditorContent editor={editor} />
        </div>
        <IonButtons style={{
          paddingRight: 5,
        }}>
          <IonButton onClick={handleSend} style={{
            border: '1px solid',
            borderRadius: 5,
          }}>
            <IonIcon icon={sendOutline} />
          </IonButton>
        </IonButtons>
      </div>
    </div>
  );
};

export default ChannelPopupText;