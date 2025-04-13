
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface TeamMember {
  name: string;
  registrationNo: string;
  profileImage?: string;
  role?: string;
}

const TeamMembers = () => {
  const teamMembers: TeamMember[] = [
    {
      name: "Murari Kumar Jha",
      registrationNo: "12325620",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256",
      role: "Team Lead"
    },
    {
      name: "Sourav Kumar",
      registrationNo: "12312853",
      profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256",
      role: "Frontend Developer"
    },
    {
      name: "Vikas Kumar",
      registrationNo: "12318187",
      profileImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256",
      role: "Backend Developer"
    }
  ];

  return (
    <section className="mb-16 animate-fade-in" style={{ animationDelay: "0.6s" }}>
      <div className="text-center mb-8">
        <h2 className="font-heading text-3xl font-bold mb-3">Our Team</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Meet the talented developers behind this AI-powered hotel finder application.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {teamMembers.map((member, index) => (
          <Card key={index} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="aspect-square overflow-hidden bg-slate-100">
              {member.profileImage ? (
                <img 
                  src={member.profileImage} 
                  alt={member.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-200">
                  <Users className="h-20 w-20 text-slate-400" />
                </div>
              )}
            </div>
            <CardContent className="pt-6">
              <h3 className="font-heading text-xl font-bold mb-1">{member.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">Registration No: {member.registrationNo}</p>
              {member.role && (
                <Badge variant="secondary" className="font-normal">
                  {member.role}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default TeamMembers;
