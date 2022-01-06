import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return {
    redirect: { destination: `${ctx.resolvedUrl}/relations`, permanent: false },
  }
}

export default function ProjectHome(): JSX.Element {
  return <div>loading...</div>
}
