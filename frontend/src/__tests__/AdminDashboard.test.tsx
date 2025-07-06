import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { Role } from '@/lib/types';

// mock dependencies
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

vi.mock('@/lib/api', () => ({
  statsAPI: {
    getAnalyticsData: vi.fn()
  }
}));

vi.mock('@/lib/utils', () => ({
  getAvatarUrl: vi.fn((id, avatar) => `https://avatar.com/${id}`),
  getInitials: vi.fn((name) => name?.charAt(0) || 'U'),
  cn: vi.fn((...args) => args.filter(Boolean).join(' ')),
  roleUtils: {
    normalizeRole: vi.fn((role) => role)
  }
}));

// mock recharts to avoid canvas issues in tests
vi.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
  Legend: ({ children }: any) => <div data-testid="legend">{children}</div>,
  ReferenceLine: () => <div data-testid="reference-line" />,
  ReferenceArea: () => <div data-testid="reference-area" />,
  ReferenceDot: () => <div data-testid="reference-dot" />,
  Brush: () => <div data-testid="brush" />,
  ErrorBar: () => <div data-testid="error-bar" />,
  Area: () => <div data-testid="area" />,
  Line: () => <div data-testid="line" />,
  Scatter: () => <div data-testid="scatter" />,
  RadialBar: () => <div data-testid="radial-bar" />,
  Radar: () => <div data-testid="radar" />,
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />
}));

const mockAnalyticsData = {
  overview: {
    totalUsers: 150,
    totalCategories: 8,
    totalTopics: 45,
    totalPosts: 125,
    totalLikes: 89
  },
  registrations: [
    { month: 'Jan 2024', count: 12 },
    { month: 'Feb 2024', count: 18 }
  ],
  activityData: [
    { month: 'Jan 2024', registrations: 12, topics: 8, posts: 25 },
    { month: 'Feb 2024', registrations: 18, topics: 12, posts: 35 }
  ],
  roleDistribution: [
    { role: 'STUDENT', count: 120 },
    { role: 'TEACHER', count: 25 },
    { role: 'ADMIN', count: 5 }
  ],
  topPerformers: [
    { _id: '1', username: 'john_doe', displayName: 'John Doe', avatar: 'avatar1.jpg', totalScore: 850, level: 8, topicsCreated: 12, postsCreated: 45, likesReceived: 23 },
    { _id: '2', username: 'jane_smith', displayName: 'Jane Smith', avatar: 'avatar2.jpg', totalScore: 720, level: 7, topicsCreated: 8, postsCreated: 32, likesReceived: 18 },
    { _id: '3', username: 'mike_wilson', displayName: 'Mike Wilson', avatar: 'avatar3.jpg', totalScore: 680, level: 6, topicsCreated: 6, postsCreated: 28, likesReceived: 15 },
    { _id: '4', username: 'sarah_jones', displayName: 'Sarah Jones', avatar: 'avatar4.jpg', totalScore: 620, level: 6, topicsCreated: 5, postsCreated: 22, likesReceived: 12 },
    { _id: '5', username: 'alex_brown', displayName: 'Alex Brown', avatar: 'avatar5.jpg', totalScore: 580, level: 5, topicsCreated: 4, postsCreated: 18, likesReceived: 10 }
  ]
};

const renderComponent = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('admin vs non-admin rendering', () => {
    it('renders dashboard for admin user', async () => {
      const { useAuth } = await import('@/contexts/AuthContext');
      const { statsAPI } = await import('@/lib/api');
      
      vi.mocked(useAuth).mockReturnValue({
        user: { _id: '1', username: 'admin', email: 'admin@example.com', displayName: 'Admin User', role: Role.ADMIN },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn(),
        checkAuth: vi.fn()
      });

      vi.mocked(statsAPI.getAnalyticsData).mockResolvedValue(mockAnalyticsData);

      renderComponent(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Comprehensive insights into your forum\'s performance')).toBeInTheDocument();
      });
    });

    it('shows access denied for non-admin user', async () => {
      const { useAuth } = await import('@/contexts/AuthContext');
      
      vi.mocked(useAuth).mockReturnValue({
        user: { _id: '1', username: 'student', email: 'student@example.com', displayName: 'Student User', role: Role.STUDENT },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn(),
        checkAuth: vi.fn()
      });

      renderComponent(<AdminDashboard />);

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText('You do not have permission to access the admin dashboard.')).toBeInTheDocument();
    });

    it('shows access denied for unauthenticated user', async () => {
      const { useAuth } = await import('@/contexts/AuthContext');
      
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn(),
        checkAuth: vi.fn()
      });

      renderComponent(<AdminDashboard />);

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  describe('data loading states', () => {
    beforeEach(async () => {
      const { useAuth } = await import('@/contexts/AuthContext');
      vi.mocked(useAuth).mockReturnValue({
        user: { _id: '1', username: 'admin', email: 'admin@example.com', displayName: 'Admin User', role: Role.ADMIN },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn(),
        checkAuth: vi.fn()
      });
    });

    it('displays loading state', async () => {
      const { statsAPI } = await import('@/lib/api');
      
      // simulate slow api call
      vi.mocked(statsAPI.getAnalyticsData).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockAnalyticsData), 1000))
      );

      renderComponent(<AdminDashboard />);

      expect(screen.getByText('Loading dashboard data...')).toBeInTheDocument();
      // Check that skeleton elements are rendered (they use data-slot="skeleton")
      const skeletonElements = document.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletonElements).toHaveLength(12); // 3 skeletons per card × 4 cards
    });

    it('displays fallback message when data is missing', async () => {
      const { statsAPI } = await import('@/lib/api');
      
      const emptyData = {
        overview: { totalUsers: 0, totalCategories: 0, totalTopics: 0, totalPosts: 0, totalLikes: 0 },
        registrations: [],
        activityData: [],
        roleDistribution: [],
        topPerformers: []
      };

      vi.mocked(statsAPI.getAnalyticsData).mockResolvedValue(emptyData);

      renderComponent(<AdminDashboard />);

      await waitFor(() => {
        // overview cards should show 0 (use getAllByText since multiple zeros exist)
        expect(screen.getAllByText('0')).toHaveLength(5); // 5 cards with 0 values
        
        // charts should be present but empty
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      });
    });
  });

  describe('correct rendering with data present', () => {
    beforeEach(async () => {
      const { useAuth } = await import('@/contexts/AuthContext');
      vi.mocked(useAuth).mockReturnValue({
        user: { _id: '1', username: 'admin', email: 'admin@example.com', displayName: 'Admin User', role: Role.ADMIN },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn(),
        checkAuth: vi.fn()
      });
    });

    it('renders overview cards with correct data', async () => {
      const { statsAPI } = await import('@/lib/api');
      vi.mocked(statsAPI.getAnalyticsData).mockResolvedValue(mockAnalyticsData);

      renderComponent(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('150')).toBeInTheDocument(); // total users
        expect(screen.getAllByText('45')).toHaveLength(2);  // total topics + john doe's posts
        expect(screen.getByText('125')).toBeInTheDocument(); // total posts
        expect(screen.getByText('89')).toBeInTheDocument();  // total likes
        expect(screen.getAllByText('8')).toHaveLength(2);   // categories + performer stat
      });
    });

    it('renders charts components', async () => {
      const { statsAPI } = await import('@/lib/api');
      vi.mocked(statsAPI.getAnalyticsData).mockResolvedValue(mockAnalyticsData);

      renderComponent(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      });
    });

    it('renders chart section titles', async () => {
      const { statsAPI } = await import('@/lib/api');
      vi.mocked(statsAPI.getAnalyticsData).mockResolvedValue(mockAnalyticsData);

      renderComponent(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Activity Over Time')).toBeInTheDocument();
        expect(screen.getByText('User Role Distribution')).toBeInTheDocument();
      });
    });
  });

  describe('top performers section', () => {
    beforeEach(async () => {
      const { useAuth } = await import('@/contexts/AuthContext');
      const { statsAPI } = await import('@/lib/api');
      
      vi.mocked(useAuth).mockReturnValue({
        user: { _id: '1', username: 'admin', email: 'admin@example.com', displayName: 'Admin User', role: Role.ADMIN },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        refreshUser: vi.fn(),
        checkAuth: vi.fn()
      });

      vi.mocked(statsAPI.getAnalyticsData).mockResolvedValue(mockAnalyticsData);
    });

    it('renders exactly 5 top performers', async () => {
      renderComponent(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Top Performers')).toBeInTheDocument();
        
        // check all 5 performers are rendered
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Mike Wilson')).toBeInTheDocument();
        expect(screen.getByText('Sarah Jones')).toBeInTheDocument();
        expect(screen.getByText('Alex Brown')).toBeInTheDocument();
      });
    });

    it('renders performer stats with correct labels', async () => {
      renderComponent(<AdminDashboard />);

      await waitFor(() => {
        // check rank badges
        expect(screen.getByText('#1')).toBeInTheDocument();
        expect(screen.getByText('#2')).toBeInTheDocument();
        
        // check stat labels are present
        expect(screen.getAllByText('Score')).toHaveLength(5);
        expect(screen.getAllByText('Topics')).toHaveLength(5);
        expect(screen.getAllByText('Posts')).toHaveLength(5);
        expect(screen.getAllByText('Likes')).toHaveLength(5);
      });
    });

    it('renders clickable performer links', async () => {
      renderComponent(<AdminDashboard />);

      await waitFor(() => {
        // check usernames are clickable links
        const johnLink = screen.getByRole('link', { name: 'John Doe' });
        expect(johnLink).toHaveAttribute('href', '/users/john_doe');
        
        const janeLink = screen.getByRole('link', { name: 'Jane Smith' });
        expect(janeLink).toHaveAttribute('href', '/users/jane_smith');
      });
    });

    it('renders performer scores and stats correctly', async () => {
      renderComponent(<AdminDashboard />);

      await waitFor(() => {
        // check john doe's stats
        expect(screen.getByText('850')).toBeInTheDocument(); // score
        expect(screen.getAllByText('12')).toHaveLength(2);  // john doe's topics + jane smith's topics
        expect(screen.getAllByText('45')).toHaveLength(2);  // overview total topics + john doe's posts
        expect(screen.getByText('23')).toBeInTheDocument();  // likes
      });
    });
  });
});
