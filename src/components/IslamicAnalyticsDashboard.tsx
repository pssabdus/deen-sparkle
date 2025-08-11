import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, Brain, BookOpen, Star, Award, Calendar, 
  AlertTriangle, Target, Users, Lightbulb, Heart, 
  ChevronRight, Download, RefreshCw
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface IslamicAnalyticsDashboardProps {
  familyId: string;
  children: any[];
}

interface ChildAnalytics {
  child_id: string;
  child_name: string;
  learning_patterns: any;
  engagement_metrics: any;
  spiritual_development_score: number;
  knowledge_retention_rate: number;
  practice_consistency_score: number;
  areas_for_improvement: string[];
  strengths_identified: string[];
  optimal_activity_suggestions: any[];
  preferred_learning_times: any[];
  recommended_interventions: any[];
  ai_insights: any;
  scholar_review_status: string;
  scholar_notes?: string;
}

interface ProgressReport {
  id: string;
  report_type: string;
  report_data: any;
  generated_at: string;
  period_covered: string;
  islamic_recommendations: any[];
  scholar_validated: boolean;
}

interface IslamicBenchmark {
  id: string;
  skill_area: string;
  age_range_min: number;
  age_range_max: number;
  benchmark_criteria: any;
  islamic_significance: string;
  assessment_methods: any[];
}

const IslamicAnalyticsDashboard = ({ familyId, children }: IslamicAnalyticsDashboardProps) => {
  const [childAnalytics, setChildAnalytics] = useState<ChildAnalytics[]>([]);
  const [progressReports, setProgressReports] = useState<ProgressReport[]>([]);
  const [benchmarks, setBenchmarks] = useState<IslamicBenchmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
    fetchBenchmarks();
  }, [familyId]);

  const fetchAnalyticsData = async () => {
    try {
      const { data: analytics } = await supabase
        .from('child_islamic_analytics')
        .select(`
          *,
          children!inner(name, family_id)
        `)
        .eq('children.family_id', familyId);

      const { data: reports } = await supabase
        .from('islamic_progress_reports')
        .select('*')
        .eq('family_id', familyId)
        .order('generated_at', { ascending: false });

      if (analytics) {
        const formattedAnalytics: ChildAnalytics[] = analytics.map(item => ({
          child_id: item.child_id,
          child_name: (item as any).children.name,
          learning_patterns: item.learning_patterns,
          engagement_metrics: item.engagement_metrics,
          spiritual_development_score: item.spiritual_development_score || 0,
          knowledge_retention_rate: item.knowledge_retention_rate || 0,
          practice_consistency_score: item.practice_consistency_score || 0,
          areas_for_improvement: item.areas_for_improvement || [],
          strengths_identified: item.strengths_identified || [],
          optimal_activity_suggestions: item.optimal_activity_suggestions || [],
          preferred_learning_times: item.preferred_learning_times || [],
          recommended_interventions: item.recommended_interventions || [],
          ai_insights: item.ai_insights,
          scholar_review_status: item.scholar_review_status || 'pending',
          scholar_notes: item.scholar_notes
        }));
        setChildAnalytics(formattedAnalytics);
      }

      if (reports) {
        setProgressReports(reports);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const fetchBenchmarks = async () => {
    try {
      const { data } = await supabase
        .from('islamic_learning_benchmarks')
        .select('*')
        .order('age_range_min');

      if (data) {
        setBenchmarks(data);
      }
    } catch (error) {
      console.error('Error fetching benchmarks:', error);
    }
  };

  const generateAnalytics = async (childId: string) => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-islamic-learning-analytics', {
        body: { childId, familyId }
      });

      if (error) throw error;

      toast({
        title: "Analytics Generated",
        description: "AI-powered Islamic learning analytics have been updated",
      });

      await fetchAnalyticsData();
    } catch (error) {
      console.error('Error generating analytics:', error);
      toast({
        title: "Error",
        description: "Failed to generate analytics",
        variant: "destructive"
      });
    }
    setGenerating(false);
  };

  const generateProgressReport = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-islamic-progress-report', {
        body: { 
          familyId,
          reportType: 'comprehensive',
          periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          periodEnd: new Date().toISOString()
        }
      });

      if (error) throw error;

      toast({
        title: "Progress Report Generated",
        description: "Comprehensive Islamic progress report has been created",
      });

      await fetchAnalyticsData();
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate progress report",
        variant: "destructive"
      });
    }
    setGenerating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading Islamic learning analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Islamic Learning Analytics</h2>
          <p className="text-muted-foreground">AI-powered insights with scholarly backing</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={generateProgressReport}
            disabled={generating}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
          <Button 
            onClick={() => children.forEach(child => generateAnalytics(child.id))}
            disabled={generating}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
            Update Analytics
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="reports">Progress Reports</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Family Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Brain className="w-8 h-8 text-primary" />
                  <Badge variant="secondary">
                    {childAnalytics.length} Children
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl">
                  {childAnalytics.length > 0 
                    ? Math.round(childAnalytics.reduce((sum, child) => sum + child.spiritual_development_score, 0) / childAnalytics.length)
                    : 0}%
                </CardTitle>
                <p className="text-sm text-muted-foreground">Average Spiritual Development</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <BookOpen className="w-8 h-8 text-emerald-600" />
                  <Badge variant="secondary">Knowledge</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl">
                  {childAnalytics.length > 0 
                    ? Math.round(childAnalytics.reduce((sum, child) => sum + child.knowledge_retention_rate, 0) / childAnalytics.length)
                    : 0}%
                </CardTitle>
                <p className="text-sm text-muted-foreground">Knowledge Retention Rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Heart className="w-8 h-8 text-rose-600" />
                  <Badge variant="secondary">Practice</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl">
                  {childAnalytics.length > 0 
                    ? Math.round(childAnalytics.reduce((sum, child) => sum + child.practice_consistency_score, 0) / childAnalytics.length)
                    : 0}%
                </CardTitle>
                <p className="text-sm text-muted-foreground">Practice Consistency</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Award className="w-8 h-8 text-amber-600" />
                  <Badge variant="secondary">Scholar Review</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-2xl">
                  {childAnalytics.filter(child => child.scholar_review_status === 'approved').length}
                </CardTitle>
                <p className="text-sm text-muted-foreground">Scholar Approved Insights</p>
              </CardContent>
            </Card>
          </div>

          {/* Individual Child Analytics */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Individual Child Insights</h3>
            {childAnalytics.map((child) => (
              <Card key={child.child_id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{child.child_name}</CardTitle>
                    <Badge 
                      variant={child.scholar_review_status === 'approved' ? 'default' : 'secondary'}
                    >
                      {child.scholar_review_status === 'approved' ? 'Scholar Approved' : 'Pending Review'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(child.spiritual_development_score)}%
                      </div>
                      <p className="text-sm text-muted-foreground">Spiritual Development</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">
                        {Math.round(child.knowledge_retention_rate)}%
                      </div>
                      <p className="text-sm text-muted-foreground">Knowledge Retention</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-rose-600">
                        {Math.round(child.practice_consistency_score)}%
                      </div>
                      <p className="text-sm text-muted-foreground">Practice Consistency</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-emerald-700 mb-2">Strengths</h4>
                      <div className="space-y-1">
                        {child.strengths_identified.slice(0, 3).map((strength, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-amber-700 mb-2">Areas for Improvement</h4>
                      <div className="space-y-1">
                        {child.areas_for_improvement.slice(0, 3).map((area, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {child.scholar_notes && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Scholar Notes
                      </h4>
                      <p className="text-sm text-muted-foreground">{child.scholar_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {childAnalytics.map((child) => (
              <Card key={child.child_id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    {child.child_name} - AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Optimal Learning Times</h4>
                    <div className="flex gap-2 flex-wrap">
                      {child.preferred_learning_times.map((time, index) => (
                        <Badge key={index} variant="outline">
                          {typeof time === 'string' ? time : JSON.stringify(time)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Recommended Activities</h4>
                    <div className="space-y-2">
                      {child.optimal_activity_suggestions.slice(0, 3).map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded">
                          <Lightbulb className="w-4 h-4 mt-0.5 text-amber-600" />
                          <span className="text-sm">
                            {typeof suggestion === 'string' ? suggestion : suggestion.activity || 'Activity suggestion'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Intervention Strategies</h4>
                    <div className="space-y-2">
                      {child.recommended_interventions.slice(0, 2).map((intervention, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-amber-50 rounded">
                          <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-600" />
                          <span className="text-sm">
                            {typeof intervention === 'string' ? intervention : intervention.strategy || 'Intervention strategy'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Progress Reports</h3>
            <Button onClick={generateProgressReport} disabled={generating}>
              <Download className="w-4 h-4 mr-2" />
              Generate New Report
            </Button>
          </div>

          <div className="grid gap-4">
            {progressReports.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No progress reports generated yet</p>
                  <Button 
                    onClick={generateProgressReport}
                    className="mt-4"
                    disabled={generating}
                  >
                    Generate First Report
                  </Button>
                </CardContent>
              </Card>
            ) : (
              progressReports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize">
                        {report.report_type} Report
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={report.scholar_validated ? 'default' : 'secondary'}>
                          {report.scholar_validated ? 'Scholar Validated' : 'Pending Validation'}
                        </Badge>
                        <Badge variant="outline">
                          {report.period_covered}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>
                      Generated on {new Date(report.generated_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <h4 className="font-medium">Islamic Recommendations</h4>
                      {report.islamic_recommendations.slice(0, 3).map((rec, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-muted rounded">
                          <ChevronRight className="w-4 h-4 mt-0.5" />
                          <span className="text-sm">
                            {typeof rec === 'string' ? rec : rec.recommendation || 'Islamic recommendation'}
                          </span>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="mt-2">
                        View Full Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          <h3 className="text-xl font-semibold">Islamic Learning Benchmarks</h3>
          
          <div className="grid gap-4">
            {benchmarks.map((benchmark) => (
              <Card key={benchmark.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{benchmark.skill_area}</CardTitle>
                  <CardDescription>
                    Ages {benchmark.age_range_min}-{benchmark.age_range_max} • {benchmark.islamic_significance}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Assessment Methods</h4>
                      <div className="flex gap-2 flex-wrap">
                        {benchmark.assessment_methods.map((method, index) => (
                          <Badge key={index} variant="outline">
                            {typeof method === 'string' ? method : method.name || 'Assessment method'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {benchmarks.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No Islamic learning benchmarks available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IslamicAnalyticsDashboard;