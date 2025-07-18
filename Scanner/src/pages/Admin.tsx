import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Lock, Users, UserPlus, Trash2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ADMIN_PASSWORD = `${import.meta.env.VITE_ADMIN_PASS}`;

interface User {
  id: number;
  lastName: string;
  password: string;
  created_at?: string;
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newUser, setNewUser] = useState({ lastName: "", password: "" });
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setPassword("");
    } else {
      toast({
        title: "Ошибка",
        description: `Неверный пароль`,
        variant: "destructive"
      });
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Ошибка загрузки пользователей:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить пользователей",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.lastName || !newUser.password) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Пользователь создан"
        });
        setNewUser({ lastName: "", password: "" });
        setShowNewUserForm(false);
        fetchUsers();
      } else {
        const errorData = await response.json();
        toast({
          title: "Ошибка",
          description: errorData.error || "Ошибка создания пользователя",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Ошибка создания пользователя:", error);
      toast({
        title: "Ошибка",
        description: "Ошибка сервера",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Вы уверены, что хотите удалить этого пользователя?")) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: "Пользователь удален"
        });
        fetchUsers();
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось удалить пользователя",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Ошибка удаления пользователя:", error);
      toast({
        title: "Ошибка",
        description: "Ошибка сервера",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsers([]);
    setShowNewUserForm(false);
    setNewUser({ lastName: "", password: "" });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm sm:max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-lg sm:text-2xl">Админ панель</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm sm:text-base">Пароль администратора</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    className="text-sm sm:text-base h-10 sm:h-11 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button type="submit" className="w-full text-sm sm:text-base h-10 sm:h-11">
                Войти
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Управление пользователями</h1>
            <p className="text-sm sm:text-base text-gray-600">Добавление и удаление преподавателей</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="text-sm sm:text-base">
            Выйти
          </Button>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Всего пользователей</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Активных</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  Активно
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6">
              <Button 
                onClick={() => setShowNewUserForm(!showNewUserForm)}
                className="w-full flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Добавить пользователя
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Форма добавления пользователя */}
        {showNewUserForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Добавить нового пользователя</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm sm:text-base">Фамилия</Label>
                    <Input
                      id="lastName"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                      placeholder="Введите фамилию"
                      className="text-sm sm:text-base h-10 sm:h-11"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm sm:text-base">Пароль</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Введите пароль"
                      className="text-sm sm:text-base h-10 sm:h-11"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button type="submit" className="text-sm sm:text-base">
                    Создать
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowNewUserForm(false)}
                    className="text-sm sm:text-base"
                  >
                    Отмена
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Список пользователей */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Все пользователи</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-center text-gray-500 py-8 text-sm sm:text-base">Загрузка...</p>
              ) : users.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm sm:text-base">Пользователи не найдены</p>
              ) : (
                users.map((user) => (
                  <div 
                    key={user.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{user.lastName}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          ID: {user.id}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Активен
                        </Badge>
                        <Button
                          onClick={() => handleDeleteUser(user.id)}
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span className="hidden sm:inline">Удалить</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;