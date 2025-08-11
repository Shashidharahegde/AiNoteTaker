import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import LogOutButton from './LogOutButton';
import { getUser } from '../auth/server';

async function Header() {
    const user = await getUser();
  return (
      <header className='relative flex h-24 items-center justify-between border-b bg-white px-4 shadow-sm'>
      <Link href="/" className='flex items-center gap-2'>
        <Image
          src="/logo.png"
          alt="notty logo"
          width={70}
          height={50}
        />
        <h1 className='flex flex-col text-2xl font-bold pb-1 leading-6'>
            Tvara <span className="text-maroon-500 font-semibold ">Notty</span>
        </h1>
      </Link>
 <div className='flex items-center gap-4'>
        {user ? (
          <LogOutButton/>
        ) : (
          <>
            <Button asChild className='hover:bg-blue-100'>
              <Link href="/login" className='text-white-700 hover:text-blue-900'>Login</Link>
            </Button>
            <Button className='bg-maroon-500 text-black px-4 py-2 rounded hover:bg-maroon-600'>
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  )
}

export default Header