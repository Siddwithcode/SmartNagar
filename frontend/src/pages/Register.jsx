import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { registerSchema } from '@/lib/validations/auth';

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser, isRegistering } = useAuth();
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'Citizen',
      terms: false,
    },
  });

  const password = watch('password');
  const role = watch('role');
  const terms = watch('terms');

  const onSubmit = async (values) => {
    setApiError('');
    try {
      const user = await registerUser(values);
      navigate(user.role === 'Admin' ? '/admin' : '/');
    } catch (error) {
      setApiError(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join the SmartNagar civic community">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" placeholder="John Doe" {...register('name')} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
          <PasswordStrength password={password} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Role</Label>
          <Select value={role} onValueChange={(value) => setValue('role', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Citizen">Citizen</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="flex items-start gap-2 text-sm">
            <Checkbox
              checked={terms}
              onCheckedChange={(checked) => setValue('terms', Boolean(checked), { shouldValidate: true })}
            />
            <span>I agree to the Terms &amp; Conditions and Privacy Policy</span>
          </label>
          {errors.terms && <p className="text-xs text-destructive">{errors.terms.message}</p>}
        </div>

        {apiError && <p className="text-sm text-destructive">{apiError}</p>}

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-600 to-blue-600"
            disabled={isRegistering}
          >
            {isRegistering ? (
              <>
                <Loader2 className="animate-spin" /> Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </motion.div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-emerald-700 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
