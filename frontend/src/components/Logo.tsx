const Logo = () => {
  return (
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className="relative">
        <div className="w-12 h-12 web3-gradient rounded-xl flex items-center justify-center shadow-web3 hover:shadow-web3-glow transition-all duration-300 group-hover:scale-110">
          <span className="text-white font-bold text-2xl">S</span>
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-web3-green rounded-full animate-pulse"></div>
      </div>
      <div className="hidden sm:block">
        <h1 className="text-2xl font-bold text-gradient group-hover:scale-105 transition-transform duration-200">
          Soul Shards
        </h1>
        <p className="text-xs text-muted-foreground/80 font-medium">
          Fully Homomorphic Encryption
        </p>
      </div>
    </div>
  );
};

export default Logo;

