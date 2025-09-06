int fib(int n) {
  if (n < 2) return n;
  return fib(n-1) + fib(n-2);
}

int main() {
  printf("%d\n", fib(6));
  return 0;
}
