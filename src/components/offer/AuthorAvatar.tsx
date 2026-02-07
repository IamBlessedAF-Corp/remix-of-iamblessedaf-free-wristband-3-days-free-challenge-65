import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import hubermanImg from "@/assets/author-huberman.jpg";
import tonyRobbinsImg from "@/assets/author-tony-robbins.jpg";
import joeDispenzaImg from "@/assets/author-joe-dispenza.jpg";

const AUTHORS = {
  huberman: {
    src: hubermanImg,
    fallback: "AH",
    alt: "Andrew Huberman",
    name: "Andrew Huberman",
    title: "Stanford Neuroscientist",
    handle: "@hubermanlab",
    followers: "7.2M",
  },
  "tony-robbins": {
    src: tonyRobbinsImg,
    fallback: "TR",
    alt: "Tony Robbins",
    name: "Tony Robbins",
    title: "#1 Life & Business Strategist",
    handle: "@tonyrobbins",
    followers: "12.4M",
  },
  "joe-dispenza": {
    src: joeDispenzaImg,
    fallback: "JD",
    alt: "Dr Joe Dispenza",
    name: "Dr. Joe Dispenza",
    title: "Neuroscientist & Author",
    handle: "@drjoedispenza",
    followers: "5.8M",
  },
} as const;

type AuthorKey = keyof typeof AUTHORS;

const AuthorAvatar = ({ author }: { author: AuthorKey }) => {
  const { src, fallback, alt, name, title, handle, followers } = AUTHORS[author];

  return (
    <div className="flex items-center gap-3 py-1">
      <Avatar className="h-14 w-14 border-2 border-border/50 shrink-0">
        <AvatarImage src={src} alt={alt} className="object-cover" />
        <AvatarFallback className="text-sm font-bold">{fallback}</AvatarFallback>
      </Avatar>
      <div className="text-left leading-tight">
        <p className="text-sm font-bold text-foreground">{name}</p>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{followers}</span>{" "}
          followers · {handle}
        </p>
      </div>
    </div>
  );
};

export default AuthorAvatar;
