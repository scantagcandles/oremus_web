export interface GlassProps {
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  opacity?: number;
  className?: string;
  children?: React.ReactNode;
}

export interface GlassCardProps extends GlassProps {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface GlassButtonProps extends GlassProps {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}