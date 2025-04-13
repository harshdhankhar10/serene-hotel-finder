
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Github, Linkedin, Mail, ExternalLink } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface TeamMember {
  name: string;
  registrationNo: string;
  profileImage?: string;
  role?: string;
  skills?: string[];
}

const TeamMembers = () => {
  const teamMembers: TeamMember[] = [
    {
      name: "Murari Kumar Jha",
      registrationNo: "12325620",
      profileImage: "https://i.ibb.co/tw39pNCS/Whats-App-Image-2025-04-13-at-10-48-32-PM.jpg",
      role: "Team Lead",
      skills: ["React", "TypeScript", "UI/UX Design"]
    },
    {
      name: "Sourav Kumar",
      registrationNo: "12312853",
      profileImage: "https://i.ibb.co/8gFKBc0s/Whats-App-Image-2025-04-13-at-10-50-23-PM.jpg",
      role: "Frontend Developer",
      skills: ["JavaScript", "Tailwind CSS", "API Integration"]
    },
    {
      name: "Vikas Kumar",
      registrationNo: "12318187",
      role: "Backend Developer",
      skills: ["Node.js", "Database Design", "Cloud Services"]
    }
  ];

  return (
    <section className="mb-16 animate-fade-in" style={{ animationDelay: "0.6s" }}>
      <div className="text-center mb-12">
        <h2 className="font-heading text-4xl font-bold mb-4 relative inline-block">
          Our Team
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-primary rounded-full"></div>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mt-6">
          Meet the talented developers behind this AI-powered hotel finder application. 
          Our team combines technical expertise with creative problem-solving to deliver an exceptional user experience.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {teamMembers.map((member, index) => (
          <Card 
            key={index} 
            className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 bg-gradient-to-br from-white to-slate-50 border-0 shadow-md"
          >
            <div className="p-6 pb-0 flex flex-col items-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full -m-1 blur-md"></div>
                {member.profileImage ? (
                  <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                    <AvatarImage src={member.profileImage} alt={member.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
              
              <h3 className="font-heading text-xl font-bold text-center">{member.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-3 text-center">Registration No: {member.registrationNo}</p>
              
              {member.role && (
                <Badge variant="secondary" className="font-normal mb-4">
                  {member.role}
                </Badge>
              )}
            </div>
            
            <CardContent className="pt-4">
              {member.skills && member.skills.length > 0 && (
                <div className="mt-2 mb-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-slate-200">
                <a href="#" className="text-slate-500 hover:text-primary transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="text-slate-500 hover:text-primary transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-slate-500 hover:text-primary transition-colors">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default TeamMembers;
