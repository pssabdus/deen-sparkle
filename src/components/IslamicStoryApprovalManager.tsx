import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, CheckCircle, XCircle, Clock, MessageSquare, BookOpen, Shield } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface StoryForReview {
  id: string;
  title: string;
  content: string;
  moral: string;
  islamic_source?: string;
  target_age_min: number;
  target_age_max: number;
  created_at: string;
  family_approval?: {
    id: string;
    approval_status: string;
    approval_notes?: string;
  };
  story_reviews?: Array<{
    id: string;
    reviewer_type: string;
    review_status: string;
    review_notes?: string;
    islamic_authenticity_score?: number;
    age_appropriateness_score?: number;
    educational_value_score?: number;
  }>;
}

interface IslamicStoryApprovalManagerProps {
  familyId: string;
  userRole: string;
}

const IslamicStoryApprovalManager = ({ familyId, userRole }: IslamicStoryApprovalManagerProps) => {
  const { user } = useAuth();
  const [pendingStories, setPendingStories] = useState<StoryForReview[]>([]);
  const [reviewedStories, setReviewedStories] = useState<StoryForReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<StoryForReview | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');

  useEffect(() => {
    fetchStories();
  }, [familyId]);

  const fetchStories = async () => {
    try {
      // Fetch stories that need family approval
      const { data: familyApprovals, error: familyError } = await supabase
        .from('family_story_approvals')
        .select(`
          id,
          approval_status,
          approval_notes,
          story_id,
          stories!inner(
            id,
            title,
            content,
            moral,
            islamic_source,
            target_age_min,
            target_age_max,
            created_at
          )
        `)
        .eq('family_id', familyId);

      if (familyError) {
        console.error('Error fetching family approvals:', familyError);
        return;
      }

      // Fetch story reviews for each story
      const storiesWithReviews = await Promise.all(
        (familyApprovals || []).map(async (approval: any) => {
          const { data: reviews, error: reviewError } = await supabase
            .from('story_reviews')
            .select('*')
            .eq('story_id', approval.story_id);

          if (reviewError) {
            console.error('Error fetching reviews:', reviewError);
          }

          return {
            ...approval.stories,
            family_approval: {
              id: approval.id,
              approval_status: approval.approval_status,
              approval_notes: approval.approval_notes
            },
            story_reviews: reviews || []
          };
        })
      );

      // Separate pending and reviewed stories
      const pending = storiesWithReviews.filter(
        story => story.family_approval?.approval_status === 'pending'
      );
      const reviewed = storiesWithReviews.filter(
        story => story.family_approval?.approval_status !== 'pending'
      );

      setPendingStories(pending);
      setReviewedStories(reviewed);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (storyId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('family_story_approvals')
        .update({
          approval_status: status,
          approval_notes: approvalNotes,
          approved_at: status === 'approved' ? new Date().toISOString() : null
        })
        .eq('story_id', storyId)
        .eq('family_id', familyId);

      if (error) {
        throw error;
      }

      toast({
        title: status === 'approved' ? "Story Approved! ✅" : "Story Rejected",
        description: status === 'approved' 
          ? "The story is now available for your child to read."
          : "The story has been rejected and will not be shown to your child.",
      });

      setApprovalNotes('');
      setSelectedStory(null);
      fetchStories();
    } catch (error) {
      console.error('Error updating approval:', error);
      toast({
        title: "Error",
        description: "Failed to update story approval.",
        variant: "destructive"
      });
    }
  };

  const getApprovalStatusBadge = (story: StoryForReview) => {
    const status = story.family_approval?.approval_status;
    const scholarReviews = story.story_reviews?.filter(r => r.reviewer_type === 'scholar') || [];
    const hasScholarApproval = scholarReviews.some(r => r.review_status === 'approved');

    if (status === 'approved' && hasScholarApproval) {
      return <Badge className="bg-green-500">✅ Fully Approved</Badge>;
    } else if (status === 'approved') {
      return <Badge className="bg-yellow-500">⏳ Scholar Review Pending</Badge>;
    } else if (status === 'rejected') {
      return <Badge variant="destructive">❌ Rejected</Badge>;
    } else {
      return <Badge variant="secondary">⏳ Pending Your Review</Badge>;
    }
  };

  const getScholarReviewSummary = (story: StoryForReview) => {
    const reviews = story.story_reviews?.filter(r => r.reviewer_type === 'scholar') || [];
    if (reviews.length === 0) {
      return <span className="text-muted-foreground text-sm">No scholar reviews yet</span>;
    }

    const approved = reviews.filter(r => r.review_status === 'approved').length;
    const pending = reviews.filter(r => r.review_status === 'pending').length;
    const rejected = reviews.filter(r => r.review_status === 'rejected').length;

    return (
      <div className="flex gap-2 text-sm">
        {approved > 0 && <Badge className="bg-green-500">✅ {approved} Approved</Badge>}
        {pending > 0 && <Badge variant="secondary">⏳ {pending} Pending</Badge>}
        {rejected > 0 && <Badge variant="destructive">❌ {rejected} Rejected</Badge>}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-4">Loading story approvals...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-islamic-green">Islamic Story Approval Center</h3>
        <p className="text-sm text-muted-foreground">
          Review AI-generated Islamic stories for your family's approval
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            Pending Review ({pendingStories.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed">
            Reviewed ({reviewedStories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingStories.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No stories pending review</p>
            </div>
          ) : (
            pendingStories.map((story) => (
              <Card key={story.id} className="shadow-elegant">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base mb-1">{story.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {story.moral}
                      </CardDescription>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline">
                          Ages {story.target_age_min}-{story.target_age_max}
                        </Badge>
                        {getApprovalStatusBadge(story)}
                      </div>
                    </div>
                    <div className="text-3xl ml-3">📖</div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {/* Scholar Review Status */}
                  <div className="bg-muted/30 p-3 rounded">
                    <p className="text-sm font-medium mb-1 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-islamic-blue" />
                      Islamic Scholar Review:
                    </p>
                    {getScholarReviewSummary(story)}
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedStory(story)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review Story
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{story.title}</DialogTitle>
                          <DialogDescription>
                            Review this AI-generated Islamic story for your family
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedStory && (
                          <div className="space-y-6">
                            {/* Story Content */}
                            <div className="prose max-w-none">
                              <div className="bg-muted/30 p-4 rounded-lg mb-4">
                                <p className="text-sm text-muted-foreground mb-2">Moral of the story:</p>
                                <p className="font-medium text-islamic-green">{selectedStory.moral}</p>
                              </div>
                              
                              <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                                {selectedStory.content}
                              </div>
                            </div>

                            {/* Scholar Reviews */}
                            {selectedStory.story_reviews && selectedStory.story_reviews.length > 0 && (
                              <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <Shield className="w-4 h-4" />
                                  Islamic Scholar Reviews
                                </h4>
                                <div className="space-y-3">
                                  {selectedStory.story_reviews.map((review, index) => (
                                    <div key={review.id} className="bg-muted/30 p-3 rounded">
                                      <div className="flex justify-between items-start mb-2">
                                        <Badge 
                                          variant={review.review_status === 'approved' ? 'default' : 
                                                   review.review_status === 'rejected' ? 'destructive' : 'secondary'}
                                        >
                                          {review.reviewer_type} - {review.review_status}
                                        </Badge>
                                        {review.islamic_authenticity_score && (
                                          <span className="text-sm text-muted-foreground">
                                            Islamic Authenticity: {review.islamic_authenticity_score}/10
                                          </span>
                                        )}
                                      </div>
                                      {review.review_notes && (
                                        <p className="text-sm">{review.review_notes}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Parent Approval */}
                            <div className="border-t pt-4">
                              <h4 className="font-semibold mb-3">Your Family Approval</h4>
                              <Textarea
                                placeholder="Add notes about your decision (optional)..."
                                value={approvalNotes}
                                onChange={(e) => setApprovalNotes(e.target.value)}
                                rows={3}
                                className="mb-4"
                              />
                              <div className="flex gap-3">
                                <Button
                                  onClick={() => handleApproval(selectedStory.id, 'approved')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Approve for My Family
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleApproval(selectedStory.id, 'rejected')}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          {reviewedStories.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No reviewed stories yet</p>
            </div>
          ) : (
            reviewedStories.map((story) => (
              <Card key={story.id} className="shadow-elegant">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base mb-1">{story.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {story.moral}
                      </CardDescription>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline">
                          Ages {story.target_age_min}-{story.target_age_max}
                        </Badge>
                        {getApprovalStatusBadge(story)}
                      </div>
                    </div>
                    <div className="text-3xl ml-3">📖</div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {story.family_approval?.approval_notes && (
                    <div className="bg-muted/30 p-3 rounded">
                      <p className="text-sm font-medium mb-1 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Your Notes:
                      </p>
                      <p className="text-sm">{story.family_approval.approval_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IslamicStoryApprovalManager;