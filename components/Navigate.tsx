import { useRouter } from "next/router"
import { useEffect } from "react"

interface NavigateProps {
  to: string;
  replace?: boolean;
  query?: Record<string, string | string[]>;
}

export default function Navigate({ to, replace = false, query }: NavigateProps) {
  const router = useRouter()

  useEffect(() => {
    const method = replace ? router.replace : router.push
    method({ pathname: to, query })
  }, [to, replace, query, router])

  return null
};
