
import { supabase } from "@/integrations/supabase/client";

/**
 * This function is used to migrate existing comments to include display_name
 * It should be called once from the component when it loads
 */
export const populateExistingDisplayNames = async () => {
  try {
    // Get all comments without display_name
    const { data: commentsWithoutDisplayName, error: fetchError } = await supabase
      .from('idea_comments')
      .select('id, user_id')
      .is('display_name', null);
      
    if (fetchError) {
      console.error("Error fetching comments without display name:", fetchError);
      return;
    }
    
    if (!commentsWithoutDisplayName || commentsWithoutDisplayName.length === 0) {
      console.log("No comments need display_name migration");
      return;
    }
    
    console.log(`Found ${commentsWithoutDisplayName.length} comments needing display_name migration`);
    
    // Process comments in batches to avoid overwhelming the database
    const batchSize = 50;
    for (let i = 0; i < commentsWithoutDisplayName.length; i += batchSize) {
      const batch = commentsWithoutDisplayName.slice(i, i + batchSize);
      
      // For each comment, get the user's display_name from profiles
      for (const comment of batch) {
        // Skip if no user_id
        if (!comment.user_id) continue;
        
        // Get user's display_name
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('id', comment.user_id)
          .single();
          
        if (userError) {
          console.error(`Error fetching user data for comment ${comment.id}:`, userError);
          continue;
        }
        
        // Determine display name (profile display_name or email)
        const displayName = userData?.display_name || userData?.email || 'مستخدم';
        
        // Update the comment with the display_name
        const { error: updateError } = await supabase
          .from('idea_comments')
          .update({ display_name: displayName })
          .eq('id', comment.id);
          
        if (updateError) {
          console.error(`Error updating display_name for comment ${comment.id}:`, updateError);
        }
      }
      
      console.log(`Processed batch ${i/batchSize + 1} of ${Math.ceil(commentsWithoutDisplayName.length/batchSize)}`);
    }
    
    console.log("Completed display_name migration for comments");
  } catch (error) {
    console.error("Error in display_name migration:", error);
  }
};
