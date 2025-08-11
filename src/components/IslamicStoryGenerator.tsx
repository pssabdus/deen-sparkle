import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Sparkles, Shield, Heart } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface IslamicStoryGeneratorProps {
  childId: string;
  familyId: string;
  onStoryGenerated?: (story: any) => void;
}

const IslamicStoryGenerator = ({ childId, familyId, onStoryGenerated }: IslamicStoryGeneratorProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [islamicFocus, setIslamicFocus] = useState<string[]>([]);
  const [customRequirements, setCustomRequirements] = useState('');

  const themes = [
    'Prophet Stories',
    'Sahaba Companions',
    'Islamic Values',
    'Acts of Kindness',
    'Prayer and Worship',
    'Helping Others',
    'Honesty and Truth',
    'Patience and Gratitude',
    'Islamic History',
    'Daily Islamic Life'
  ];

  const ageGroups = [
    { value: '3-6', label: '3-6 years (Early Childhood)' },
    { value: '7-10', label: '7-10 years (Middle Childhood)' },
    { value: '11-15', label: '11-15 years (Pre-teen)' }
  ];

  const islamicFocusOptions = [
    'Quran Stories',
    'Prophet Muhammad (PBUH)',
    'Other Prophets',
    'Sahaba Stories',
    'Islamic Morals',
    'Daily Prayers',
    'Ramadan & Fasting',
    'Charity (Zakat)',
    'Hajj Pilgrimage',
    'Islamic Etiquette',
    'Family Values',
    'Community Service'
  ];

  const toggleIslamicFocus = (focus: string) => {
    setIslamicFocus(prev => 
      prev.includes(focus) 
        ? prev.filter(f => f !== focus)
        : [...prev, focus]
    );
  };

  const generateStory = async () => {
    if (!theme || !ageGroup) {
      toast({
        title: "Missing Information",
        description: "Please select a theme and age group.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-islamic-story-generator', {
        body: {
          childId,
          familyId,
          theme,
          ageGroup,
          islamicFocus,
          customRequirements,
          requestedBy: user?.id
        }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "Story Generated! 📚",
          description: "Your Islamic story has been created and is being reviewed by our Islamic scholars.",
        });
        
        onStoryGenerated?.(data.story);
        
        // Reset form
        setTheme('');
        setAgeGroup('');
        setIslamicFocus([]);
        setCustomRequirements('');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error generating story:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate Islamic story. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-islamic-green">
          <Sparkles className="w-5 h-5" />
          AI Islamic Story Generator
        </CardTitle>
        <CardDescription>
          Create personalized Islamic stories with authentic teachings, reviewed by Islamic scholars
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Authentication and Review Process Info */}
        <div className="bg-muted/30 p-4 rounded-lg space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-islamic-blue" />
            Islamic Authenticity Guarantee
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <BookOpen className="w-3 h-3 text-islamic-green" />
              <span>Authentic Sources Only</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-islamic-blue" />
              <span>Scholar Reviewed</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-3 h-3 text-pink-500" />
              <span>Parent Approved</span>
            </div>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Story Theme</label>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an Islamic theme..." />
            </SelectTrigger>
            <SelectContent>
              {themes.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Age Group Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Age Group</label>
          <Select value={ageGroup} onValueChange={setAgeGroup}>
            <SelectTrigger>
              <SelectValue placeholder="Select appropriate age group..." />
            </SelectTrigger>
            <SelectContent>
              {ageGroups.map((group) => (
                <SelectItem key={group.value} value={group.value}>
                  {group.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Islamic Focus Areas */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Islamic Focus Areas (Optional)</label>
          <div className="flex flex-wrap gap-2">
            {islamicFocusOptions.map((focus) => (
              <Badge
                key={focus}
                variant={islamicFocus.includes(focus) ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  islamicFocus.includes(focus) 
                    ? 'bg-islamic-green hover:bg-islamic-green/90' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => toggleIslamicFocus(focus)}
              >
                {focus}
              </Badge>
            ))}
          </div>
        </div>

        {/* Custom Requirements */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Special Requests (Optional)</label>
          <Textarea
            placeholder="Any specific Islamic teachings or character traits you'd like emphasized in the story..."
            value={customRequirements}
            onChange={(e) => setCustomRequirements(e.target.value)}
            rows={3}
          />
        </div>

        {/* Generate Button */}
        <Button 
          onClick={generateStory}
          disabled={loading || !theme || !ageGroup}
          className="w-full bg-gradient-to-r from-islamic-green to-islamic-blue hover:from-islamic-green/90 hover:to-islamic-blue/90"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Islamic Story...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Generate Story
            </div>
          )}
        </Button>

        {/* Disclaimer */}
        <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded border-l-4 border-islamic-blue">
          <p className="font-medium mb-1">Review Process:</p>
          <p>All generated stories are reviewed by qualified Islamic educators for authenticity and appropriateness before being made available to children. Parents will receive notifications when stories are approved for their family.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default IslamicStoryGenerator;