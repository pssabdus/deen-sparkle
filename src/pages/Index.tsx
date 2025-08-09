import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Star, Shield, Heart, Moon } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-cream via-background to-muted">
      {/* Hero Section */}
      <section className="relative py-20 px-6 text-center overflow-hidden">
        {/* Islamic decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Moon className="absolute top-10 left-10 text-islamic-green/20 w-20 h-20" />
          <Star className="absolute top-20 right-20 text-islamic-gold/30 w-12 h-12" />
          <Star className="absolute bottom-20 left-20 text-islamic-blue/25 w-8 h-8" />
          <Star className="absolute bottom-40 right-10 text-islamic-gold/20 w-16 h-16" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-islamic-green to-islamic-blue rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-elegant animate-pulse">
              🌙
            </div>
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Qodwaa Islamic Learning
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              A safe, engaging platform where Muslim children learn Islam through 
              interactive stories, prayer tracking, and gamified experiences - 
              all under loving parental guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-islamic-green hover:bg-islamic-green/90 text-white shadow-lg">
                <Link to="/auth">Start Your Family Journey</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-islamic-green text-islamic-green hover:bg-islamic-green/10">
                <Link to="/auth">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Why Families Love Qodwaa
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="shadow-elegant border-border/50 hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-islamic-green/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-islamic-green" />
                </div>
                <CardTitle className="text-islamic-green">Family-Centered</CardTitle>
                <CardDescription>
                  Parents have full control and visibility into their children's 
                  Islamic learning journey
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-elegant border-border/50 hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-islamic-blue/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-islamic-blue" />
                </div>
                <CardTitle className="text-islamic-blue">Interactive Stories</CardTitle>
                <CardDescription>
                  Beautiful Islamic stories with audio narration and 
                  comprehension activities
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-elegant border-border/50 hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-islamic-gold/10 rounded-lg flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-islamic-gold" />
                </div>
                <CardTitle className="text-islamic-gold">Gamified Learning</CardTitle>
                <CardDescription>
                  Points, badges, and rewards make Islamic learning 
                  fun and engaging
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-elegant border-border/50 hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-islamic-coral/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-islamic-coral" />
                </div>
                <CardTitle className="text-islamic-coral">Safe Environment</CardTitle>
                <CardDescription>
                  No external links, no social features - a completely 
                  safe digital space
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-elegant border-border/50 hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-purple-500" />
                </div>
                <CardTitle className="text-purple-500">Personal Companion</CardTitle>
                <CardDescription>
                  Each child gets their own Islamic companion to guide 
                  their learning
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-elegant border-border/50 hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center mb-4">
                  <Moon className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-green-600">Prayer Tracking</CardTitle>
                <CardDescription>
                  Help children build consistent prayer habits with 
                  visual tracking
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-islamic-green to-islamic-blue text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Start Your Family's Islamic Learning Journey Today
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of Muslim families who are nurturing their children's 
            Islamic education with Qodwaa
          </p>
          <Button asChild size="lg" variant="secondary" className="bg-white text-islamic-green hover:bg-white/90">
            <Link to="/auth">Create Free Family Account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
