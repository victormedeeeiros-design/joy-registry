import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Check, X, Mail, Calendar } from "lucide-react";

interface RSVP {
  id: string;
  guest_name: string;
  guest_email: string;
  message?: string;
  will_attend: boolean;
  created_at: string;
  updated_at: string;
}

interface RSVPListProps {
  siteId: string;
}

export const RSVPList = ({ siteId }: RSVPListProps) => {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRSVPs();
  }, [siteId]);

  const loadRSVPs = async () => {
    try {
      const { data, error } = await supabase
        .from('site_rsvps')
        .select('*')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRsvps(data || []);
    } catch (error) {
      console.error('Erro ao carregar RSVPs:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as confirmações de presença.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const attendingCount = rsvps.filter(rsvp => rsvp.will_attend).length;
  const notAttendingCount = rsvps.filter(rsvp => !rsvp.will_attend).length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Confirmações de Presença
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Carregando confirmações...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Confirmações de Presença
        </CardTitle>
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
              <Check className="h-3 w-3 mr-1" />
              {attendingCount} confirmaram
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
              <X className="h-3 w-3 mr-1" />
              {notAttendingCount} não vão
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              <Users className="h-3 w-3 mr-1" />
              {rsvps.length} total
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {rsvps.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              As confirmações aparecerão aqui conforme os convidados responderem
            </p>
          ) : (
            rsvps.map((rsvp) => (
              <div key={rsvp.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{rsvp.guest_name}</span>
                    <Badge variant={rsvp.will_attend ? "default" : "secondary"} className={
                      rsvp.will_attend 
                        ? "bg-green-100 text-green-800 hover:bg-green-100" 
                        : "bg-red-100 text-red-800 hover:bg-red-100"
                    }>
                      {rsvp.will_attend ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Confirmou
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3 mr-1" />
                          Não vai
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Mail className="h-3 w-3" />
                    {rsvp.guest_email}
                  </div>
                  {rsvp.message && (
                    <p className="text-sm text-muted-foreground italic mt-2">
                      "{rsvp.message}"
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(rsvp.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};