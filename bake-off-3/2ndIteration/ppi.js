// Identifies the correct screen density (i.e., PPI) -- DO NOT CHANGE!
// https://gist.github.com/scryptonite/5242987

function Display(facts, screen)
{
  this.poll(facts, screen);
}

Display.prototype.poll = function(facts, screen)
{
  screen = screen || window.screen;
  this.facts = facts || this.facts || {};
  
  this.screen = {};
  this.screen.ppi = (screen.devicePixelRatio || devicePixelRatio)*100;
  this.screen.width = screen.width;
  this.screen.height = screen.height;
  this.screen.diagonal = Math.sqrt(
    Math.pow(this.screen.width, 2) + 
    Math.pow(this.screen.height, 2)
  );
  
  this.guess = {};
  this.guess.ppi = (function(){
    try 
    {
      var el = document.createElement("div");
      el.style.width = "72pt";
      document.body.appendChild(el);
      var _ppi = (this.screen.ppi/100)*(el.offsetWidth || 96);
      document.body.removeChild(el);
      return _ppi;
    } 
    catch(e)
    {
      return 96;
    }
  }.bind(this))();
  this.guess.width = this.screen.width/this.guess.ppi;
  this.guess.height = this.screen.height/this.guess.ppi;
  this.guess.diagonal = Math.sqrt(
    Math.pow(this.guess.width, 2) + 
    Math.pow(this.guess.height, 2)
  );
  
  if ("diagonal" in this.facts)
  {
    this.facts.width = Math.sqrt(
      Math.pow(this.facts.diagonal, 2) - (
        Math.pow(this.facts.diagonal, 2) * 
        Math.pow(this.screen.height / this.screen.width, 2)
      )
    );
    this.facts.height = this.facts.width * (this.screen.height / this.screen.width);
    this.facts.diagonal = this.facts.diagonal + 0;
    this.facts.ppi = Math.round(
      this.screen.width / Math.sqrt(
        Math.pow(this.facts.diagonal, 2) * 
        (
          Math.pow(this.facts.width, 2) / 
          (
            Math.pow(this.facts.width, 2) + 
            Math.pow(this.facts.height, 2)
          )
        )
      )
    );
  } 
  else if ("width" in this.facts)
  {
    this.facts.width = this.facts.width + 0;
    this.facts.height = (this.screen.height/this.screen.width)*this.facts.width;
    this.facts.diagonal = Math.sqrt(
      Math.pow(this.facts.width, 2) + 
      Math.pow(this.facts.height, 2)
    );
    this.facts.ppi = Math.round(
      this.screen.width / Math.sqrt(
        Math.pow(this.facts.diagonal, 2) * 
        (
          Math.pow(this.facts.width, 2) / 
          (
            Math.pow(this.facts.width, 2) + 
            Math.pow(this.facts.height, 2)
          )
        )
      )
    );
  } 
  else if ("height" in this.facts)
  {
    this.facts.width = (this.screen.width/this.screen.height)*this.facts.height;
    this.facts.height = this.facts.height + 0;
    this.facts.diagonal = Math.sqrt(
      Math.pow(this.facts.width, 2) + 
      Math.pow(this.facts.height, 2)
    );
    this.facts.ppi = Math.round(
      this.screen.width / Math.sqrt(
        Math.pow(this.facts.diagonal, 2) * 
        (
          Math.pow(this.facts.width, 2) / 
          (
            Math.pow(this.facts.width, 2) + 
            Math.pow(this.facts.height, 2)
          )
        )
      )
    );
  } 
  else if ("ppi" in this.facts)
  {
    this.facts.width = this.screen.width / this.facts.ppi;
    this.facts.height = this.screen.height / this.facts.ppi;
    this.facts.diagonal = Math.sqrt(
      Math.pow(this.facts.width, 2) + 
      Math.pow(this.facts.height, 2)
    );
    this.facts.ppi = this.facts.ppi + 0;
  } else {
    this.facts.width = this.guess.width;
    this.facts.height = this.guess.height;
    this.facts.diagonal = this.guess.diagonal;
    this.facts.ppi = this.guess.height;
  }
  
  this.width = this.facts.width || this.guess.width;
  this.height = this.facts.height || this.guess.width;
  this.diagonal = this.facts.diagonal || this.guess.diagonal;
  this.ppi = this.facts.ppi || this.guess.ppi;
  
  if(!this.facts.__halt)
  {
    this.poll({ ppi: this.ppi, __halt: true }, screen);
  }
  
  delete this.facts.__halt;
  return this;
};