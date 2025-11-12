import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Award, Trophy, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

export default function Results() {
  const presidentialResults = [
    { id: 1, name: "Candidato A", party: "Partido Alpha", votes: 12345, percentage: 35.2, color: 'hsl(220 85% 45%)' },
    { id: 2, name: "Candidato B", party: "Partido Beta", votes: 10234, percentage: 29.1, color: 'hsl(200 95% 45%)' },
    { id: 3, name: "Candidato C", party: "Partido Gamma", votes: 8567, percentage: 24.4, color: 'hsl(0 75% 55%)' },
    { id: 4, name: "Candidato D", party: "Partido Delta", votes: 3943, percentage: 11.3, color: 'hsl(220 15% 65%)' },
  ];

  const regionalResults = [
    { id: 1, name: "Regional A", party: "Partido Alpha", votes: 8234, percentage: 42.1, color: 'hsl(220 85% 45%)' },
    { id: 2, name: "Regional B", party: "Partido Beta", votes: 6123, percentage: 31.3, color: 'hsl(200 95% 45%)' },
    { id: 3, name: "Regional C", party: "Partido Gamma", votes: 5199, percentage: 26.6, color: 'hsl(0 75% 55%)' },
  ];

  const distritalResults = [
    { id: 1, name: "Distrital A", party: "Partido Alpha", votes: 3421, percentage: 38.5, color: 'hsl(220 85% 45%)' },
    { id: 2, name: "Distrital B", party: "Partido Beta", votes: 2987, percentage: 33.6, color: 'hsl(200 95% 45%)' },
    { id: 3, name: "Distrital C", party: "Partido Gamma", votes: 2476, percentage: 27.9, color: 'hsl(0 75% 55%)' },
  ];

  const totalVotesPresidential = presidentialResults.reduce((sum, r) => sum + r.votes, 0);
  const totalVotesRegional = regionalResults.reduce((sum, r) => sum + r.votes, 0);
  const totalVotesDistrital = distritalResults.reduce((sum, r) => sum + r.votes, 0);

  const renderResults = (results: typeof presidentialResults, totalVotes: number) => (

    <>
      {/* Combined Chart */}
      <Card className="border-border shadow-elegant mb-6">
        <CardHeader>
          <CardTitle className="text-xl text-center">Votos totales por partido político</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart
              data={results}
              margin={{ top: 20, right: 60, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left" 
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                label={{ value: 'Votos', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--foreground))' } }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                domain={[0, 50]}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                label={{ value: 'Participación %', angle: 90, position: 'insideRight', style: { fill: 'hsl(var(--foreground))' } }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'Votos') return [value.toLocaleString(), name];
                  if (name === 'Participación %') return [`${value}%`, name];
                  return [value, name];
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="square"
              />
              <Bar 
                yAxisId="left" 
                dataKey="votes" 
                name="Votos"
                radius={[8, 8, 0, 0]}
              >
                {results.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="percentage" 
                name="Participación %"
                stroke="hsl(25, 95%, 53%)"
                strokeWidth={3}
                dot={{ fill: 'hsl(25, 95%, 53%)', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card className="border-border shadow-elegant">
        <CardHeader className="gradient-hero border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-primary-foreground flex items-center gap-2">
                <Award className="h-6 w-6" />
                Resultados Detallados
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Distribución de votos actualizada en tiempo real
              </CardDescription>
            </div>
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Posición</TableHead>
                <TableHead>Candidato</TableHead>
                <TableHead>Partido</TableHead>
                <TableHead className="text-right">Votos</TableHead>
                <TableHead className="text-right">Porcentaje</TableHead>
                <TableHead className="text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow key={result.id}>
                  <TableCell>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'gradient-hero text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{result.name}</TableCell>
                  <TableCell className="text-muted-foreground">{result.party}</TableCell>
                  <TableCell className="text-right font-mono">{result.votes.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <span className="text-lg font-bold">{result.percentage}%</span>
                  </TableCell>
                  <TableCell className="text-center">
                    {index === 0 && (
                      <div className="flex items-center justify-center gap-1 text-primary">
                        <Trophy className="h-4 w-4" />
                        <span className="text-sm font-medium">Líder</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell colSpan={3} className="text-right">Total de Votos:</TableCell>
                <TableCell className="text-right font-mono">{totalVotes.toLocaleString()}</TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-8">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">Resultados Electorales</h1>
          <p className="text-lg text-muted-foreground">Conteo en tiempo real de votos registrados</p>
        </div>

        {/* Tabs for different election types */}
        <Tabs defaultValue="presidential" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="presidential">Presidencial</TabsTrigger>
            <TabsTrigger value="regional">Regional</TabsTrigger>
            <TabsTrigger value="distrital">Distrital</TabsTrigger>
          </TabsList>

          <TabsContent value="presidential" className="space-y-6 mt-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 gradient-hero rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{totalVotesPresidential.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Votos Totales</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 gradient-accent rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{presidentialResults.length}</div>
                      <div className="text-sm text-muted-foreground">Candidatos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 gradient-secondary rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">98.5%</div>
                      <div className="text-sm text-muted-foreground">Participación</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {renderResults(presidentialResults, totalVotesPresidential)}
          </TabsContent>

          <TabsContent value="regional" className="space-y-6 mt-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 gradient-hero rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{totalVotesRegional.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Votos Totales</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 gradient-accent rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{regionalResults.length}</div>
                      <div className="text-sm text-muted-foreground">Candidatos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 gradient-secondary rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">96.2%</div>
                      <div className="text-sm text-muted-foreground">Participación</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {renderResults(regionalResults, totalVotesRegional)}
          </TabsContent>

          <TabsContent value="distrital" className="space-y-6 mt-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 gradient-hero rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{totalVotesDistrital.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Votos Totales</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 gradient-accent rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">{distritalResults.length}</div>
                      <div className="text-sm text-muted-foreground">Candidatos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 gradient-secondary rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">94.8%</div>
                      <div className="text-sm text-muted-foreground">Participación</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {renderResults(distritalResults, totalVotesDistrital)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

