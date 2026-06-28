import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { loginSchema } from '@/lib/validations/auth';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoggingIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const rememberMe = watch('rememberMe');

  const onSubmit = async (values) => {
    setApiError('');
    try {
      const user = await login(values);
      navigate(user.role === 'Admin' ? '/admin' : '/');
    } catch (error) {
      setApiError(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to the SmartNagar civic portal">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={rememberMe}
              onCheckedChange={(checked) => setValue('rememberMe', Boolean(checked))}
            />
            Remember me
          </label>
          <button type="button" className="text-sm text-blue-600 hover:underline">
            Forgot password?
          </button>
        </div>

        {apiError && <p className="text-sm text-destructive">{apiError}</p>}

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-blue-600" disabled={isLoggingIn}>
            {isLoggingIn ? (
              <>
                <Loader2 className="animate-spin" /> Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </motion.div>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-emerald-700 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
