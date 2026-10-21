import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-300 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">页面不存在</h2>
        <p className="text-slate-500 text-sm mb-6">你访问的页面找不到了</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
