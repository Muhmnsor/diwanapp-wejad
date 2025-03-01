
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches idea data based on selected export options
 */
export const fetchIdeaData = async (ideaId: string, options: string[]) => {
  const data: any = {};
  
  // Always fetch basic idea information
  console.log("Fetching basic idea information...");
  const { data: ideaData, error: ideaError } = await supabase
    .from("ideas")
    .select(`
      *,
      created_by_user:created_by(email)
    `)
    .eq("id", ideaId)
    .maybeSingle();
    
  if (ideaError) {
    console.error("Error fetching idea data:", ideaError);
    throw new Error(`Failed to fetch idea data: ${ideaError.message}`);
  }
  
  if (!ideaData) {
    console.error("No idea data found");
    throw new Error("No idea data found");
  }
  
  data.idea = ideaData;
  
  // Fetch comments if requested
  if (options.includes("comments")) {
    console.log("Fetching comments...");
    const { data: commentsData, error: commentsError } = await supabase
      .from("idea_comments")
      .select("*")
      .eq("idea_id", ideaId)
      .order("created_at", { ascending: true });
      
    if (commentsError) {
      console.error("Error fetching comments:", commentsError);
      throw new Error(`Failed to fetch comments: ${commentsError.message}`);
    }
    
    data.comments = commentsData || [];
  }
  
  // Fetch votes if requested
  if (options.includes("votes")) {
    console.log("Fetching votes...");
    const { data: votesData, error: votesError } = await supabase
      .from("idea_votes")
      .select("*")
      .eq("idea_id", ideaId);
      
    if (votesError) {
      console.error("Error fetching votes:", votesError);
      throw new Error(`Failed to fetch votes: ${votesError.message}`);
    }
    
    data.votes = votesData || [];
  }
  
  // Fetch decision if requested
  if (options.includes("decision")) {
    console.log("Fetching decision data...");
    // تعديل الاستعلام ليتناسب مع بنية قاعدة البيانات الفعلية
    const { data: decisionData, error: decisionError } = await supabase
      .from("idea_decisions")
      .select(`
        *
      `)
      .eq("idea_id", ideaId)
      .maybeSingle();
      
    if (decisionError) {
      console.error("Error fetching decision:", decisionError);
      throw new Error(`Failed to fetch decision data: ${decisionError.message}`);
    }
    
    // إذا وجدنا بيانات القرار، سنحاول الحصول على معلومات المستخدم الذي اتخذ القرار
    if (decisionData && decisionData.created_by) {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("email")
        .eq("id", decisionData.created_by)
        .maybeSingle();
        
      if (!userError && userData) {
        decisionData.decision_maker = { email: userData.email };
      }
    }
    
    data.decision = decisionData;
  }
  
  return data;
};
