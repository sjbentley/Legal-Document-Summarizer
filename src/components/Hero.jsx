import React from "react";

import { logo } from "../assets";

const Hero = () => {
  return (
    <header className='w-full flex justify-center items-center flex-col'>
      <nav className='flex justify-between items-center w-full mb-10 pt-3'>
        <img src={logo} alt='sumz_logo' className='w-28 object-contain' />

        <button
          type='button'
          onClick={() =>
            window.open("https://github.com/TidbitsJS/Summize", "_blank")
          }
          className='blue_btn'
        >
          GitHub
        </button>
      </nav>

      <h1 className='head_text'>
        Legal Analysis with <br className='max-md:hidden' />
        <span className='blue_gradient '>OpenAI GPT-4</span>
      </h1>
      <h2 className='desc'>
      Simplify the law with Gist.Ai, a legal summarizer that analyzes key clauses, risks,  obligations, and complex agreements in Seconds.
      </h2>
    </header>
  );
};

export default Hero;
