import { AnimationController } from '@ionic/angular';
const animationCtrl = new AnimationController();
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
export const customAnimation = (_: HTMLElement, opts: any) => {
  // create root transition
  const rootTransition = animationCtrl
    .create()
    .duration(opts.duration || 250)
    .easing('cubic-bezier(0.7,0,0.3,1)');

  const enterTransition = animationCtrl.create().addElement(opts.enteringEl);
  const exitTransition = animationCtrl.create().addElement(opts.leavingEl);

  // Remove opacity transitions to avoid fading effect
  enterTransition.fromTo('opacity', '1', '1');
  exitTransition.fromTo('opacity', '1', '1');

  if (opts.direction === 'forward') {
    // Forward direction moves right
    enterTransition.fromTo('transform', 'translateX(100%)', 'translateX(0%)');
    exitTransition.fromTo('transform', 'translateX(0%)', 'translateX(-100%)');
  } else {
    // Backward direction moves left
    enterTransition.fromTo('transform', 'translateX(-100%)', 'translateX(0%)');
    exitTransition.fromTo('transform', 'translateX(0%)', 'translateX(100%)');
  }

  rootTransition.addAnimation([enterTransition, exitTransition]);
  return rootTransition;
}
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
// Assuming you have the post object with the createdAt property

const objectCreatedAt = new Date();
const currentTime = new Date();

export const  getTimeElapsedString=(createdAt:Date, currentTime:Date)=> {
  const timeDiff = currentTime.getTime() - createdAt.getTime();
  const seconds = Math.floor(timeDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
  }
}

const timeElapsedString = getTimeElapsedString(objectCreatedAt, currentTime);
// console.log(timeElapsedString); // Example output: "posted 2 hours ago"
