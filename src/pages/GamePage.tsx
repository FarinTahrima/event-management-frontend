import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Dices, Grid3X3, Calculator } from 'lucide-react';
import Pong from '../components/Pong';
import Checkers from '../components/Checkers';
import Tetris from '../components/Tetris';
import Game2048 from '../components/2048';
import { useQuery } from 'react-query';
import { getSubscriptionStatus } from '@/utils/api-client';
import { useAppContext } from '@/contexts/AppContext';

const GamePage: React.FC = () => {

  const { user } = useAppContext();

  const { data: subscriptionStatus } = useQuery(
    ["subscriptionStatus", user?.email],
    () => getSubscriptionStatus(user?.email || ""),
    {
      enabled: !!user?.email,
    }
  );

  return (
    <div>
      {subscriptionStatus?.status === "active" &&
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-900 text-white">
          <div className="container mx-auto p-8">
            <header className="text-center mb-12">
              <h1 className="text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                Mini Games Arcade
              </h1>
              <p className="text-xl text-gray-300">Select a game and start playing!</p>
            </header>

            <Tabs defaultValue="pong" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="pong" className="text-lg flex items-center justify-center">
                  <Grid3X3 className="mr-2" /> Pong
                </TabsTrigger>
                <TabsTrigger value="checkers" className="text-lg flex items-center justify-center">
                  <Gamepad2 className="mr-2" /> Checkers
                </TabsTrigger>
                <TabsTrigger value="tetris" className="text-lg flex items-center justify-center">
                  <Dices className="mr-2" /> Tetris
                </TabsTrigger>
                <TabsTrigger value="2048" className="text-lg flex items-center justify-center">
                  <Calculator className="mr-2" /> 2048
                </TabsTrigger>
              </TabsList>

              <div className="game-content bg-gray-800 p-6 rounded-lg shadow-lg">
                <TabsContent value="pong">
                  <Card>
                    <CardHeader>
                      <CardTitle>2 Player Pong</CardTitle>
                      <CardDescription>Classic 1 vs 1 game. Beat your opponent</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Pong />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="checkers">
                  <Card>
                    <CardHeader>
                      <CardTitle>Checkers</CardTitle>
                      <CardDescription>Strategic board game for two players.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Checkers />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tetris">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tetris</CardTitle>
                      <CardDescription>Arrange falling blocks to clear lines!</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tetris />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="2048">
                  <Card>
                    <CardHeader>
                      <CardTitle>2048</CardTitle>
                      <CardDescription>Merge tiles to reach 2048!</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Game2048 />
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      }
      {subscriptionStatus?.status == "inactive" &&
        <div className="container mx-auto p-4">
          <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            <p>Please subscribe to our premium plan to access games!</p>
          </div>
        </div>
      }
    </div>
  );
};

export default GamePage;