import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GreetingProps {
  backendMessage: string | null;
}

export function Greeting({ backendMessage }: GreetingProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>hello from frontend</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{backendMessage ?? 'Backend unreachable'}</p>
      </CardContent>
    </Card>
  );
}
