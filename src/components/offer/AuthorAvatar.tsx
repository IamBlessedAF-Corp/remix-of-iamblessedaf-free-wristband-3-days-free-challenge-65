import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import hubermanImg from "@/assets/author-huberman.jpg";
import tonyRobbinsImg from "@/assets/author-tony-robbins.jpg";
import joeDispenzaImg from "@/assets/author-joe-dispenza.jpg";

const AUTHORS = {
  huberman: { src: hubermanImg, fallback: "AH", alt: "Andrew Huberman" },
  "tony-robbins": { src: tonyRobbinsImg, fallback: "TR", alt: "Tony Robbins" },
  "joe-dispenza": { src: joeDispenzaImg, fallback: "JD", alt: "Dr Joe Dispenza" },
} as const;

type AuthorKey = keyof typeof AUTHORS;

const AuthorAvatar = ({ author }: { author: AuthorKey }) => {
  const { src, fallback, alt } = AUTHORS[author];

  return (
    <Avatar className="h-7 w-7 border border-border/50">
      <AvatarImage src={src} alt={alt} className="object-cover" />
      <AvatarFallback className="text-[10px] font-bold">{fallback}</AvatarFallback>
    </Avatar>
  );
};

export default AuthorAvatar;
