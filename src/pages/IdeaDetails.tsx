import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, MessageSquare, ThumbsUp, ThumbsDown, CornerDownLeft } from "lucide-react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState } from "react";

interface Idea {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string | null;
  created_at: string;
  created_by: string;
  discussion_period: string;
  opportunity: string;
  problem: string;
  benefits: string;
  required_resources: string;
  contributing_departments: { name: string; contribution: string }[];
  expected_costs: { item: string; quantity: number; total_cost: number }[];
  proposed_execution_date: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  idea_id: string;
  parent_id: string | null;
}

interface Vote {
  vote_type: 'up' | 'down';
  user_id: string;
  idea_id: string;
}

const IdeaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: idea, isLoading: isIdeaLoading } = useQuery({
    queryKey: ['idea', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Idea;
    }
  });

  const { data: comments = [], isLoading: isCommentsLoading } = useQuery({
    queryKey: ['comments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('idea_comments')
        .select('*')
        .eq('idea_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Comment[];
    }
  });

  const { data: votes = [], isLoading: isVotesLoading } = useQuery({
    queryKey: ['votes', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('idea_votes')
        .select('*')
        .eq('idea_id', id);

      if (error) throw error;
      return data as Vote[];
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      const { data, error } = await supabase
        .from('idea_comments')
        .insert([
          {
            idea_id: id,
            content,
            parent_id: parentId,
            user_id: 'temp-user-id' // سيتم تحديثه لاحقاً عند إضافة نظام المستخدمين
          }
        ]);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      setComment("");
      setReplyTo(null);
      toast.success(replyTo ? "تم إضافة الرد بنجاح" : "تم إضافة التعليق بنجاح");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إضافة التعليق");
    }
  });

  const voteMutation = useMutation({
    mutationFn: async (voteType: 'up' | 'down') => {
      const { data, error } = await supabase
        .from('idea_votes')
        .insert([
          {
            idea_id: id,
            vote_type: voteType,
            user_id: 'temp-user-id' // سيتم تحديثه لاحقاً عند إضافة نظام المستخدمين
          }
        ]);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes', id] });
      toast.success("تم تسجيل تصويتك بنجاح");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء التصويت");
    }
  });

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setIsSubmitting(true);
    try {
      await addCommentMutation.mutateAsync({ 
        content: comment,
        parentId: replyTo
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (type: 'up' | 'down') => {
    await voteMutation.mutateAsync(type);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'draft':
        return 'مسودة';
      case 'under_review':
        return 'قيد المراجعة';
      case 'approved':
        return 'تمت الموافقة';
      case 'rejected':
        return 'مرفوضة';
      default:
        return 'مؤرشفة';
    }
  };

  const getCommentReplies = (commentId: string) => {
    return comments.filter(c => c.parent_id === commentId);
  };

  const getRootComments = () => {
    return comments.filter(c => !c.parent_id);
  };

  const renderComment = (comment: Comment, level: number = 0) => {
    const replies = getCommentReplies(comment.id);
    const isReplyBeingAdded = replyTo === comment.id;

    return (
      <div key={comment.id} className="relative">
        <div className={`bg-muted p-4 rounded-lg ${level > 0 ? 'mr-8 border-r border-primary/20' : ''}`}>
          <p className="text-sm text-muted-foreground mb-2">
            {new Date(comment.created_at).toLocaleDateString('ar-SA')}
          </p>
          <p className="text-foreground mb-3">{comment.content}</p>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              if (isReplyBeingAdded) {
                setReplyTo(null);
              } else {
                setReplyTo(comment.id);
                setComment('');
              }
            }}
          >
            <CornerDownLeft className="ml-2 h-4 w-4" />
            {isReplyBeingAdded ? 'إلغاء الرد' : 'رد'}
          </Button>

          {isReplyBeingAdded && (
            <div className="mt-4 flex gap-4">
              <Textarea
                placeholder="اكتب ردك هنا..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleAddComment}
                disabled={isSubmitting || !comment.trim()}
              >
                <MessageSquare className="ml-2 h-4 w-4" />
                إضافة رد
              </Button>
            </div>
          )}
        </div>

        {replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {replies.map(reply => renderComment(reply, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isIdeaLoading || isCommentsLoading || isVotesLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">جاري التحميل...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">لم يتم العثور على الفكرة</div>
        </main>
        <Footer />
      </div>
    );
  }

  const upVotes = votes.filter(v => v.vote_type === 'up').length;
  const downVotes = votes.filter(v => v.vote_type === 'down').length;

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <main className="flex-1 container mx-auto px-4 py-8" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              className="mb-4"
              onClick={() => navigate('/ideas')}
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة إلى القائمة
            </Button>
            
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-primary mb-2">{idea.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span>بواسطة: {idea.created_by}</span>
                  <span>•</span>
                  <span>{new Date(idea.created_at).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusClass(idea.status)}`}>
                {getStatusDisplay(idea.status)}
              </span>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-3">وصف الفكرة</h2>
              <p className="text-muted-foreground leading-relaxed">{idea.description}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">المشكلة</h2>
              <p className="text-muted-foreground leading-relaxed">{idea.problem}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">الفرصة</h2>
              <p className="text-muted-foreground leading-relaxed">{idea.opportunity}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">الفوائد المتوقعة</h2>
              <p className="text-muted-foreground leading-relaxed">{idea.benefits}</p>
            </section>

            {idea.contributing_departments?.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-3">الإدارات المساهمة</h2>
                <div className="space-y-3">
                  {idea.contributing_departments.map((dept, index) => (
                    <div key={index} className="bg-muted p-4 rounded-lg">
                      <h3 className="font-medium mb-2">{dept.name}</h3>
                      <p className="text-sm text-muted-foreground">{dept.contribution}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {idea.expected_costs?.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-3">التكاليف المتوقعة</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="text-right p-3">البند</th>
                        <th className="text-center p-3">الكمية</th>
                        <th className="text-center p-3">التكلفة الإجمالية</th>
                      </tr>
                    </thead>
                    <tbody>
                      {idea.expected_costs.map((cost, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-3">{cost.item}</td>
                          <td className="text-center p-3">{cost.quantity}</td>
                          <td className="text-center p-3">{cost.total_cost} ريال</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            <div className="space-y-6">
              <div className="flex justify-between items-center bg-muted p-4 rounded-lg">
                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleVote('up')}
                  >
                    <ThumbsUp className="ml-2 h-4 w-4" />
                    مؤيد ({upVotes})
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleVote('down')}
                  >
                    <ThumbsDown className="ml-2 h-4 w-4" />
                    معارض ({downVotes})
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {!replyTo && (
                  <div className="flex gap-4">
                    <Textarea
                      placeholder="أضف تعليقك هنا..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleAddComment}
                      disabled={isSubmitting || !comment.trim()}
                    >
                      <MessageSquare className="ml-2 h-4 w-4" />
                      إضافة تعليق
                    </Button>
                  </div>
                )}

                <div className="space-y-6">
                  {getRootComments().map(comment => renderComment(comment))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default IdeaDetails;
