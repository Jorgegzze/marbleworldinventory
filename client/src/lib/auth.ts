interface User {
  id: number;
  email: string;
  role: 'admin' | 'salesrep';
}

// Simple client-side auth
export const auth = {
  login(email: string, password: string): User {
    // For Squarespace integration, we'll use a simple auth
    // You should replace this with your actual authentication system
    const user: User = {
      id: 1,
      email,
      role: email.includes('admin') ? 'admin' : 'salesrep'
    };
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  logout() {
    localStorage.removeItem('user');
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getUser();
  }
};
