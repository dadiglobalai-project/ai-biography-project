import desktopLogo from '../assets/images/xinghuoji-logo-desktop.png';
import compactLogo from '../assets/images/xinghuoji-logo-compact.png';

interface BrandLogoProps {
  variant?: 'hero' | 'mobile' | 'mark' | 'desktop';
  className?: string;
  imgClassName?: string;
}

const logoByVariant = {
  hero: desktopLogo,
  desktop: desktopLogo,
  mobile: compactLogo,
  mark: compactLogo,
};

const defaultSizeByVariant = {
  hero: 'w-72 max-w-full',
  desktop: 'w-56 max-w-full',
  mobile: 'w-44 max-w-full',
  mark: 'w-32 max-w-full',
};

export default function BrandLogo({
  variant = 'desktop',
  className = '',
  imgClassName = '',
}: BrandLogoProps) {
  const classTokens = className.split(/\s+/).filter(Boolean);
  const hasBaseDisplayClass = classTokens.some((token) =>
    /^(hidden|block|inline|inline-block|flex|inline-flex|grid|inline-grid|contents)$/.test(token)
  );

  return (
    <span
      className={[
        hasBaseDisplayClass ? 'select-none items-center' : 'inline-flex select-none items-center',
        defaultSizeByVariant[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <img
        src={logoByVariant[variant]}
        alt="Xinghuoji AI Biography and Digital Legacy Platform"
        className={['block h-auto w-full object-contain', imgClassName].filter(Boolean).join(' ')}
        draggable={false}
      />
    </span>
  );
}
