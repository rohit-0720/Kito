import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, X, Settings } from 'lucide-react';
import YouTube, { YouTubePlayer } from 'react-youtube';
import { VinylPlayer } from './components/VinylPlayer';
import { SearchQueuePanel } from './components/SearchQueuePanel';
import { SessionPanel } from './components/SessionPanel';
import { SettingsModal } from './components/SettingsModal';
import { QueueSheet } from './components/QueueSheet';
import { PixelKitten } from './components/PixelKitten';

import { BackgroundParticles, ParticleMode } from './components/BackgroundParticles';
import { Toaster } from './components/ui/sonner';
import { socket } from '../lib/socket';

interface Song {
  id: string;
  title: string;
  thumbnail: string;
  instanceId?: string;
}

interface User {
  id: string;
  name: string;
  color: string;
}

const NEKO_SPRITES = [
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABIklEQVR4nO1WSQ7EMAiDUf//ZeYwoguYLdVIPdSnqklsB0gI0QsMeQJntKAiQuPLG7ILRUQkIUTjqfinMMCI4KcBzUUcpYFsV0oQCTgEBi9TdFwNMB27bakYka455Vc9l4LISCYAB6xBK6zYAtI0b0akg5CvKkLMxpgv+p9hIx/COUsfTmv7s6CF01pKQZT7QU3siIoQ4pxjFWPmy/fUzCT87YvoZKbkn6SAu1XeFW9PMtjDcI6IMWd5BfwjorUidLdZMSZZb1g6BQTqYdghbxkISaMGldXEtAZaJwEczVu9oN2ikZEKlQERkfSBkTWmam1l4BJudNtlhsDa+6dg+CRrIe0FaDdTVBGLIiAqnIkreSZiOBxZtHKyZfh0L+a/eA6+YR662bT+YjsAAAAASUVORK5CYII=",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA40lEQVR4nO1XyxLDIAiUTv7/l+mhsfUBsogZM233ZkZ2F2SIUpoHN2uaIUGDWrHEXH8iEqlMfq9rboU7wpcRmPeBCpfiUrb527mHk1C1iIGu5Kv2wgauAnJW5rmr5EA/QAYERyNBl8b2CiA9QG1m1hoVhzacqEogVeTqQcSasEj6MRM2oCqCo9jUGUVVWRORqwLC1BS1hk04I57jmtGsYvskNA14s88oqxAyMDuE0NiRgW4AzcAaSPfvgZ83EOqDVfeBlDb+C0Qj74V+SYV5D6eBknjJw+T2Tfj9BqKAX0B/aHgCdIBeOO78F8UAAAAASUVORK5CYII=",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABDklEQVR4nO1Wyw4DIQiEpv//y/TQuEVXmBG3ySbtnFQQRuWhSh02zLViBG0anXwE1otUU1Oh8JE5907a2MxOzsf1yb7wIBmBzpiqduMRbc3MujECJDASuVqXJvAtQAL+6huiGBjnIDBFROQJNeT85tEVMw5LBNg3XUxNESGzYDSE5m2NIQ4L0YzAzPCMhNsb+qGfAJ3Iy9jT0wQ8iZnD5jSSXUIAGV5x6oGCUCup5TaLgDijK6GqUmnF6h36hM67nSWRD7Ji/wYiB60FRynIABGwanA5EqmB+3fDP4HbEph9WCtYKsUe7CcFYbcUqySF5tJSDAyXe8YygeRUJRJLBIgr3eqeGUxASd3U/2G8AFt7mTLOfRenAAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABF0lEQVR4nO2W3Q6DMAiFYdn7vzK70E5KDpTS6s1GYqJt5XzlR8tUM1H3XPSx9LKIHAzMKRfuomUABKHn1DzUehUBoKCIkIh8gZhZwwl6970DAAExM4EoCR2RaBO8JQIRhH5utycEE21KQQQBrKuFbQCO2NBmAERd2fYb2sjLlTiwQ1tooZDTilEXyMh5NezavAgMxdMCV6qgFhrcLR6m+dY2zJgF2Lb7CsDj4hagZOaH040/AmD/gJbjdoBOrfB17ABWP6+VGrqlDTP9DwGqXbASuQbQKWuHXpXbta0QZ3avAciecpuzKCpaXA9nxRsAOmIzcAzFveesMQBonqC6dy4wPqcAtFj6gIJgZvM/vTiC2eTzbz9oHxxQekFCimcpAAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABKUlEQVR4nOWX3Q7CMAiFD2bv/8p4sdGxFljpT7zwJMaoG+cDCpnAv4sWxOAZj1kABgBmBtEZivnJc33v+mQAmkxrs8q0XBNBpAAsQy9zB6jx+yQASGdWkYGIysu7H2cVH6RHAiCUVCAAEIiHMhW44sddi1qBuwKlElmAtBRwmRgNmQVgPXISsPNGs02ZM2BOgScPsp4Iq6HaRX5vzImoO3vPHHBaoMrFlrlcIwHr917z5sMd++5VNsvAPLUJl0BEG1BkHcL5lBFnreWeAb3j35bPqDnwrEBZFBbQDnN9YWrGV5kDiU2YbcNSgFXjOASw0xw4D6G5ZrMa6b8AvAXalz6qFoxmMXofMPBI5rRneEQKQE8WM5l6+uwK3KvjV8ai7Q+lq9T8oVilL9sKg2SESmbvAAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABGElEQVR4nO2W3Q6DMAiFwfj+r8xupBLKb+vijSfZkilwPmmlA/j0snAhhzbzlwEIAIDo9kcc6csglcTJeCqyAZIlUGTsgLQgjk5wpgu2TpwAtJ6+AUHyvgewZF7QVNcC2DY3ukBeXQ0wgsTOdlWIGcaq7kiUABNhZkBEZgwiAptm3WQAMgbM8nDpLOG0B7rmXheieFBvgV53vGOffRMYVEIc6ubfzD0dhvl1qdZW3nD6Gn8qAAj2mpchLCC5rKr1UrR8GMmiVheqsCkAm0hTQbdlDgB4dhP1vKh0yDMfX77X/eRWF4Li4yfYJ+MISjtgbcTIWAwmTgyXOeyAiqFo6nmHTab2n1Ijz5ukjwNICDSurdT79Ol9/QD98LQSLfZm6wAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABBklEQVR4nO1V0Q6EMAiDi///y9yLLHUC66Ymd4lNTNQArQWcyIsfgMH1NM8JHxERMxMzS4OeIm8C2OBV8v3jUgGqqh55txMluQsQFOFCbhAxJEcBd4qwgvz0UqMgTAZRUWyZG2Gv12pFQ9hXRDeqdS2Zcc4wdhsJQCFQzB80i2HRO0ANTrAtVB4jYAozg4oCMY9uAVMYgRtVxV0WkIFtyaUWrAJXEX1aHiSS8PDKb6ZboKq0vcxPbJN9Gsk/2NKul3WlsD44G+YJBi4cBGSrwwrJXKpENAGYXAzN0AbPj4T2B1ET0CdHSglEdTI3QkvCA2YRp7YGR/zyl9IinK97fpr3xYs/wxfuy7Lj/kO2hgAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABHElEQVR4nO2WwRLDIAhEof//z9tLSJUAATTTQ7uHzKSi+6JIIfrry+JCLDat4060DGQcgO3PPHmXQUKDY/Ezhj7BU4y8q/gSQGig40bDFfNoAgyICc4wfw6gCNI+gluA1IJFiFfLJdABLvSg+PruB5hZXO8T7DEAZT7tyDjmAbAqMGmNSalAAECDhTtQgmDmi7kBcdHdEaQgxDh7c8abkskBlq9bkQeXTUKmhbyIVL0FJkS3aHUATMkRabi7dyJCB+CyC5KAACq5AiLi5R2wYLJTz0dTZl+Qci5ew2AdFhIzBwzTa14sAIjc5kXgjLF+B5OBsEAERvcLu/4NvSLFYiaAql94tB+YQLz82AnQKtX7i/vcgun14fz+w3oDTA6XRee9YIQAAAAASUVORK5CYII=",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABDklEQVR4nO2WSxLDIAxDUaf3v7K7aEKJI/8I7abRMjHWsw0Mrf27kIiRYvwSgG4q8vEHDuFLYFgSGU3pIlDvKaCwA6cfBtwGVYaIFtBRmMkmILxgyRpfgXBHUDVXEMxD9LeHleSqOVlPN7cJ4CWPlDUvA4iICwGgZF4G8CCYuYiEoywDMBmVp2QBIDvvq1rSASZdgDodvV1fA8jqWV2g571X5px/SzIFcMpiGLIToYTWfjgCa1N7AKeTYLU/o9mbMH0coxtS7ZUenHoT6qr321BXFcCivTfeISizCQEgfKYNtCzBCHHQ1Cmwqnc6Yramct/2Loxmuu3qe5i/BLAbkFm7r55VAGPymbW3blG9AHEphjo0CJF9AAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA80lEQVR4nO2WwRLDIAhEoZP//2V6qHZMdHGRNL24M7kosi+IjiI5WfmW9cqYm5mYWQV5HOAWbYC/AxzBeK/Z2jllE9KBUrqeSqpK52a3gDYvwSLk0WQAQuZRiBnAknkEInwKyv7S8zOIEICqiplBiNl8FACWf2RSzVG8gCrQFfAMGECk5ZuwNYnALQF4BuhP2SpEr+LOJCtUgXxmMi8C+FzmgePkqcnTJYQVqM+tEYR3D4zGvKeb24Q/qEAnCFAXZRutrkcQXg98V1y3ooXyxi/wp5zt4EynLExFBn8LfUIvom4AVCKSP9Nlo1Lc07VbW0/qDae6gB08t42YAAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA+0lEQVR4nO1Wyw7EIAiEzf7/L7MXadTKY6gemuwkPRSFGVFBojykfZHNs9/wyZKLXPGktzV7TyZtcLY/EqCMW+fBAk4gI6BPf5RaZG5aQBaCpF7xLTK5/whecQb+ApiZS8Gbn+sMZyASg4qF6gAzk4iYJPP4sTqwEqHkKNICEAIvS2UBHkl19UTBCVUuJbw5d6sMxk2eUin2SFFYW5B+0QBYxrQyoCnbJULI2IboEC6dvDqAxMkIOI5UL3jI4fpng7tXsXoFiYAtsKobImoFqA7MInqSqChtEdAHZ+ZbRiqFCTlgQ1s2fDNzBrziGg7Y/SJCkekRJ/rIOfwAzH6TFVfg/LAAAAAASUVORK5CYII=",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABA0lEQVR4nO2XzRKDMAiEwfH9X5kebDQSfhOcHurepDPuR8DVAvy78KH7UtSjEuA0Jbr8EW8Wg98KAA0FGkp3swPGJoqaa2as4+Fnt7BiroCU7kDIPAPCiyTUxeWqgth44WtCQs2bryoLfADwIDxlIUUAC8IyQMT0mFSAZshvqEHMmLsAFtjsPpQAZCUloARA2rZXdesB/EQbHJse3h5EPE+kP5nZvdjhmo2aeP31bBpqEkfw5MxDAJkuvTFYTwAHwH62XuIl4NKvY7d9fkItBXkaRgB2B2p4/1d2D+DnAHJDac4r0RwJohuEtScsSUNEGWzza6kBRL8FZwA8hf+MvHrV6wMLunpMS0n3sAAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABHUlEQVR4nO2WyxbDIAhEh578/y/TRWpKEFCRnm4yS19zeWgCPPqzaHM/756dBbiMmW0GIpLnW4sIAI6MeTP9mGjTm4Fcr9YyAEpnQEIoILLWeYBbJQggIOcdOAAFJWBmMLNrPNJqBsx6Thk5GXhFZrh3b855oAagzc7BM9prLhv9DEBnJsd/YdwBCIgGAj2n7/2svPp3ABLCirpBrIBE5npiqcPl3c+aA7l3YCiRoWGqygFmopaK3oFQzgdmybwB3E4afOGuJszeCK0DJ/FU90WNl4ke+JZgaqM2r8hCyTXMRg+oJmwRRZG1+leYWxu7j46GmfnJWFH3DnhvvlP/7SaQJbD+dMkyqTLXAGV1TQPMqBrObMJgvNT8EQC8AQ4mj0+E62kZAAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABHElEQVR4nO2WwRLDIAhE2U7//5fppVjUFVHTaQ/ZmVwSw74gEEVu/Vi4KI7uxjwFUBER1Y8/UEKmYu8CdMZd4CTIDoBGxgOQoc/jm+YZeQCVupguMX+/M3yxysBs8a6iuN0WuMVa3z7jGkF4AFjlquoIpJOr9ukaBhEWoYGoKjUCELYiA2wh0l1wuAXwIB6i6oLV/l6EAsuiARTzzJ6uqEk52npYHUSXQogkagBAudqg2WyRcVwgntK0BduKkwIM/gUwAGqQaS+fhV1II9uadC2EiWRx+jekLWJBRs/M3A+sVbWRWQT4+8yE1YufE9GZoO0CkKu8bF/MUj4DG2l16kwHlquJUl+R19GRjKR2+XR8dCglMcKvvXXrL/UCkH+5C6s6Dz0AAAAASUVORK5CYII=",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABAklEQVR4nO2V2xKDMAhE2U7//5fpi1iCXBJL60zHfdKY5CwkINGti4VgnJNvHWJ5eMxM6oYzMzFzbmCb0G2CBSzKMtBtYoADICJCaqDRhAsn8jNwgCkTZ4yE8OHBm+zJbpCBtw3TtU8PDoAKI1GZ7ouqQDwDU2JmieQAnoVqlZcwMkHvaIe6Xlg3GBjOfiGS8s5UCo/AptmCPgWXBroAleQI4Fysn+jQB4aXL2VB94Mq7CVDE/1j3cBqFuQoJztqauB0c9GAbA8AYRW48Cq6qHSzknb7uQeQ8y2qZepS673Kv6GO2sDP1C3brMD7aMHqvaNZCMTdUIcPM3ZNp7p16+/1AoBksuBmmrTtAAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABCElEQVR4nO2XwRLDIAhEodP//2V6aDa1gBEUc+h0T5mUuk8UJUzrkuaZs39+Jgb3A+Qdwpz2HgIIBoe0if59Ro+eOQxhyswkIqdphTnRJwMYjfHcGsB8hwCA3N5qTmSXwOykneYeQEiVUKMyDKmpjvSZ0AsyJXhl7sWqku3CLANEdMC4XldpMhWxAyKyTmXZ8CCmqqBStwIcmfxK5+0Z0BAhAO+qbS+qFUUOovOCas2rNmZ6CSpmvQSwOnM9gSgAV888C2A0C6QzmAFg7PxII6qrxImVLADRcYxGIUTE9JV4D5UcRCMIhDkQMt2QRPoAB8yeKRPew++FwLhnFz4F0Hm/p07/+nm9AC/+b1UxIU8OAAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABJ0lEQVR4nOWW2xLDIAhEl0z//5fpQ6NFJCAa04cy0+klsnsELwX+PWhgDN+gMZ3MzK0/EZUH9fMKhJfIygQaRkMltMNB7BlKU2vM+WwI4GUZn8mdsq6GNfOMuQUQJnpVmYkCoFVNkMg8O3sAOKS4MGAhuDUqgFxUo2WW44iofE/1qACQhJDiRJSqRBZCK4fbzxT5zr75TejLh43ngTa6Slhm+t0CFpVgr63hSbgaEtDaJeFdcJJsMQf6FnQan9zbtmM3kwiggmQh9OyvqjgKkIaIFmYVTQAInXsWJwDKVCArPhRbAK6u6scAMhCz+2toHWgA67jeVgHpA+c8mQWYPZy6PP2XLCvW9SG7RVdbQPo1UJlmzBNrwIVYacEyBPC7CmyP5sLx4g2TyYdbcQVdwQAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABH0lEQVR4nOVX0RLCIAwrnv//y/EFbgVaGjp2emdedFLSUCCrIhzgfI7j7fs47uLFBpIAAAEwinLxjgiTYzQKGTclq6u8iIpLtcxBCwAgpZQp8USoYqqoZQ76DBjE03hVuqpGSgAaMYsdEadvwTYYmdhZfUdOnIFIgJnZE5S5CZSAJysQnYHSiPTqxpVaz0xyKkCUB6gfZqJh/KgAL+mS+BJ0xgm7B/4QHqlAzZmqQMhPOWHmFrCv5EhA2oRYEV+34p8UsNXTbcDkHQXoPYfI0t9DqLlur2j2hPrgNVvNGlHYQdn5n9gB2xu8+l77MFSjC3JatMWcfauUfs90POA3n96cCdH/Ao8g2ib65GZ8AEaJ01fllhHdTX4HT5nVH+IDSk+VHrQ/yTUAAAAASUVORK5CYII=",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABHUlEQVR4nOVWWw7DMAiDqfe/MvvoQ4xAMHlok2ZpmloS7AIhEGGQ66efrd37T/FCyEWERKTkGMUxsTcTc9t5iQDmx88ZChFrt+HvEj/7gDVykzFzQ9wRCglAaqAhVyQNcbVeIAHIl48CjsAulGqg7PxMS5cjE+AyR4K82sh4UgEzuV8RASIVheg4es+of7gGdHi9qFg78vWwgIi06xiMAtStyBRjoQiXRODiHIpA6h++jqtA23EmYOoYIiK+3op/UoCd/1bB9WsF6JwLUbe/p9BTVDQnuCOZbasj84AeULrrfP49w4fXG6L4NheQckDWFr13bPVWSZ850+vFCGBgT4PxCjOpQluvxUwfYOeKLhfPbCPimWO6Erua1x/gDfHvngq4OJEYAAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA/ElEQVR4nO2WUQ/DIAiEj2X//y+zF2ksgmCL3UsvWbJM4nfisRbYL24fU5/dcGaXvd1ACAeA7x/hDABUDW70YYHoQBG6TFQaSLW8MwKgLgMpeCvcYiCUPvnjBrSkE48b0J3YNYYuXGfgioEhbcxsbi5QqTFNrYKzaY8kxrIG0mOWBTc2ZwxM4VGLDbDAz1+uwDXAvWcHDszHcKntEsSJSMMjA8tKmBjkjWFJ6FTg0gZuk2d3HhkoG7cILOozcBueabln4AQnojBMuuYKXIoHuLdmmUjsnypg4zfoNe9hYx2gG8mpCbkCgvNH0a9ZJ76dm8X6VVr1W/erV/X6AU6CeC0t3vKrAAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABCElEQVR4nO2WzRKDMAiE2Y7v/8r0kqSISVzS0F5kxoPK8G34U5F803J17ZUNVx2y0wXcwjMFUHARkWM3uNBpf+yEz8BAQ1nmNgF0youQytXsKfDgWp6m9mcCRvYXATYLqQIA+NRffRbiXiKpqgAYQ5wI04ihKYjO+NCsAHYR0WPWAdkgfgypElAL5k7g6iIKLRjG12cF8mkqLyacdlaE9T8KSQBoR0TIRtPgT21ftT3gVuRS012imz1gOTY2PIxtqhnUP3L3p5K3r9KOEzsBVDlrCTCpUxq853hKQ2T+V+CMM/uXsxqf24RGTVeEb2Kzcm8ZzOcY9eqd+NvmjXZelLbzp/exx3LsDfOJkxZk2B+5AAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA+UlEQVR4nO2VSw6AIAxEKfH+V64bwfIpTPm5cRKNgdB50FKd08XPs1W+NcnMAeQbgBMQXYDdEB4NLCCWgtATkKSXMKwvIgprlwNwy3gHhKyBaP4EPyKoCE8AwEe/CyCRTMXudMgiLGpAOxUicsyswZmIqwAzElAQSPUa5jsbAUOv6VAjEgbTDSsAvO7AbkMNIOpBmHNvMe9AsBysRsyNRswVgFhrXoxUDVf0gex3npz49XpRGC2OamEzKtJtiQzdDlQhLZafEYmFS8zjy6jkJAz9IBkqPhBTdXKiGSEASXuWZtq1zHbc9LhakwCZZg6ndkkKJuL++vW9bhYolBau0DkQAAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABA0lEQVR4nO2WSw7DIAxEPVHuf2V30TgyCP8SoJuOVKkthHkG24HIFl+fpTq8QWYWkN8A7IA4KLHVKyHQLXz/vkzbyYCetwRgaGyATIFociBjruZNOZJhEqqtXq6DKB/5MgDRzshFp3yRXdgNga+3XXLWGDNbsKUI3Lp/omqvEIBVICFEP+F2j0C8I6pAjAZDCMmBjCKIUSOC90DFnCjumuHr+I15Rh4AAEzpC94unKM/NQQR8cTmJBXXGFQefn0EfVKWcsDpfqU1SB1HBQCjFpzJk36OhsiGk7kzmuZkdFoAKQDWUfcLBHdHMW/W02NRFURklrkX2KMqqKb+/pvNX3891QdsP4ApjDDinQAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABBElEQVR4nN2X2wrDQAhEx9L//+XpQ7PB7FVdE2gHCoVtnIOuxgJ/JB4fl15Z5iRBsoA8CsDDOKRdgIu5iACAPAmwZQ4A74DXLN/6zATjJTbX25oRTwlcl83aEVaA0E23QFgAttpsBbECaMyP2g61OvcCNMFJDk1W516AYdp6JsXcG68HQKjZXowMBl3A8py6C5cgNYB+qZzBrCaj3+nv9aWsizVNey1dhtV5RwK0o3j0RBfMWJIpRdrLKKrfBJjNgUcAMnUbgDUbVgAZtdyqFbMAGrOZqWdqelcyEZEzckYmIjsh8B0u7GRE4PxfEAXQhkWhreWWLsjaBzYZ8rdi/5j7BX0ADfCTHKrbEI8AAAAASUVORK5CYII=",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABCklEQVR4nNWX4Q7DIAiEYdn7vzL7MW3QgnLIlvSSJUus3KcopUQPlrTfkV5ZcxEhEekgaTFq3NzHIMyZWCmAC6QKIpsCbobHeoPP7/Ktx0OEyDJu274MHExJNAWQeZtAFLghEQDYHIHYAaTNoxDwLdidfvR2QADMTCLimuzGUQB32yyTbo7GswCEVK3vRgEDE7DPU2dhCDID6JfMFSxq4j2n/8+Hck7Wcttn6TTsxg0x0b0UezNMsGBKlhTZl1GZngmwqgN/AahUGKCqAUkDaOnT713F6n7ArfGJ+z8IaslmCG8n6LvyUJFAe8LBwFhp2PgUQBt2pToXuB+oVhSAsx8eVQAZ/aZwVOsDqwuPItm/Ur4AAAAASUVORK5CYII=",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABCklEQVR4nO2WSw7DMAhEcdX7X9ldJFQO5jfYirLISFmkJcOTwcZEr3D189miT4mg920gJQCGGEDuBxhBViAsgE7AEq+UpNmeh1drl5DGSfj/yfCIt3xxAMXcTF6B8IJUCC2ZAxtCbGlCUSZIywAMwUJhIIDI3CpHFaDJhNpyj+9ocqK4SVKNKEGS3ukg9UyQdVf6YBvABcI0KkIgLTsRJLo/9P8CANKsAjSpeg70lb0/ClkBNfn5QxkARU81I+KdKUFqzhuTMvw2KsF4BqhGzoiW38LbZFpuLVn2/LfOBWgXrDQbW5Aoi1uC7A2IY71blPThsphXMivxmAiZhNawcgGS+l9UgfhXz9EPsSqlDRy22m8AAAAASUVORK5CYII=",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABCUlEQVR4nO2W0a7EIAhEnZv9/1/2vpRdtB0YXLtPnaRJExEPKGhrjx5p6se3XX8yQe+3gMgABrEbpARAQH4P4EHal9mA9xeNHYtxR4DNMUNw64+GDFhqp8ik6PyWVLbn5f4B4B1pFvEuLZ2BI923ACBzDqCSndTwKgMUorK4WqrLZQhA2ooMgnkYJsxRs0wYUDB2Wo8CVKvAoKoQdAssxeZQPfll8MgXc8ii9JBqBpSwTp6iKKNKKW2Bn+e+NMX+HChSAG57DSkAPWsoarTMLgIYStH+lVYdDVcAroiW7FgTam28jk+KmoqiKRtXTsAAaA+4WmAuvawfOLsu3QWJ/DOsqn0Pi0er+gdkMKQLf5051AAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA9klEQVR4nO2VzRLDIAiEs528/yvTS5NRyvKjTHsJx6jwueDmOJ54Yi2kK9FrpbiItEEwgDB5F4QFkL5hBwRtAUl+wbVBuDPwCyXCIRySf92+A+LMbPIK74alAAAsJVtRYcUH7lgFHSPVAla4ozVlAAC08AesJAvbPFUICt7rQUvMRaqAJ2/UAus7ALEg0gpo6dltE+DTQU8zYQnH4pVBrAJMINMH1XOtTGVIqw/ZtGOtCIOwADLP8MpEYXf8IHJCERHXYnfd0AOY5E6+dbrOTKr0L8hKXWmJOwO7nm+ooROBAVAPsAp4JhUYk6ScMAgU9+uzT/w33t2WoP+qWuSTAAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA70lEQVR4nO1Wyw7DMAgr0/7/l73LmAglBJNKU6X6VDUBm0dCjuPBDYHN9QEvlhxARrJa3xagLBGJklNgBJQJmCy0MhCQtKJnBGQE4UI1C++igJi5GbVFqwQiQv2/XMCVuKeAWe07PUE1oa2xkonI8M2KYbqGOutfMUv/TAmk2uVV8vImh18abEacuLLfzkWkzqN60AF1j+GpH9gxvCNg2owdEd0HSbaBElERAMYha7sSAABpVMnRXNquBAzpjm67TFBgG4qgeoB8kpWQ3gNRNCxcxrwjmQlAhVid24F0chQMLWOPWUGZkIXc720f/BcfQ6ib3RoDepoAAAAASUVORK5CYII=",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABBElEQVR4nO2W0Q7DIAhFYdmH98/ZEwkiIhebLE16X5bVyj0iRYlePVByOD7og5qLSGayGz8GUJfIRM0hIQBlAyQLrQwEJq3VIwCZQThQzcK3CEBERMw8GHgoP14RBGCDMjOJyPSLCq4BXaWaejj7rKJyBqyx/r/MmD73YLcBIOlFstH+DO8SsmEyFaEJsvgitvGxigkg6MC8A0BkmksEg8aF+oALHlUlvKBuEU6tGT2GTwCW50IHonshyV6AICoAggRE5+4AxJx6YaCk223n7gCGdFfba9QbMgioBsArWUlpH1h1OkQuYz4QrwCkYqzBs8uI3bqgZctqQ5ElM/i+n/vqv/oBKoa/WI/BrT0AAAAASUVORK5CYII=",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA1ElEQVR4nO1USQ7EIAxzRvP/L6eXgUlTstDCpYqlqmyJTTAAhUKhUCjsB3uTn93kzOyKWCHASt7IXTwVYO0wRQ4A3wXkvR+tB0B6cLYC3D5J3tr6fwo0vJAV0Emt0jIziC4bPM2NRIwjLvH/GJFoGkJgb+y+hiEiAWk3T6In9QQsJW/l1zmnj0CajYhM40lizzdP3oGeVIqYMCwDcOW7R2Alj8blHwDdvgXWvddVkUcwWh+9A6ERIw9oQaofRP9yeIkjQZJw4JmUgLQoqSOx7i73y3AA4giQ7eL+8PYAAAAASUVORK5CYII=",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA10lEQVR4nO2UUQ7EIAhEYbP3vzL7wxo6IqKpadIwSWNKlXmClahUKpVKpbMSfYb6nDQXCb1vARg5zJ1vABAYrx919zoOgb6bpi05M4cGsJYxmK2AkPYUdnYZMYawHmhH5JljQmbuTLQSrrldo/Oa7wwgZZ7VH9L6nvwNU3oKoJUwAkhdJBmZ0nftW66AOUjEzO2JzKONrN4DHYw18mKBuRARb50BWwUbw7gHg1Dbh9CDsKbYptH85XugSxD03wOC98lqzRElngFZQ4TJAqShLEdi3q73y/QDzYaO9US4bAEAAAAASUVORK5CYII="
];

const SPRITES = {
  up1: NEKO_SPRITES[1],
  up2: NEKO_SPRITES[2],
  right1: NEKO_SPRITES[5],
  right2: NEKO_SPRITES[6],
  down1: NEKO_SPRITES[9],
  down2: NEKO_SPRITES[10],
  left1: NEKO_SPRITES[13],
  left2: NEKO_SPRITES[14],
  sit: NEKO_SPRITES[28],
  wave: NEKO_SPRITES[25]
};

function RetroNekoCat() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const pinkImgRef = useRef<HTMLImageElement>(null);
  const [animKey, setAnimKey] = useState(0);
  const [catState, setCatState] = useState<'running' | 'waving' | 'idle'>('idle');

  const stateRef = useRef(catState);
  useEffect(() => { stateRef.current = catState; }, [catState]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCatState('running');
      setAnimKey(k => k + 1);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    if (!containerRef.current || !imgRef.current) return;

    const drawSprite = (spriteSrc: string) => {
      if (imgRef.current && imgRef.current.src !== spriteSrc) {
        imgRef.current.src = spriteSrc;
      }
      if (pinkImgRef.current && pinkImgRef.current.src !== spriteSrc) {
        pinkImgRef.current.src = spriteSrc;
      }
    };

    const speed = 1.2;
    const radiusX = 100;
    const radiusY = 35;
    const centerX = -100;
    const centerY = 0;

    if (animKey === 0) {
      drawSprite(SPRITES.sit);
      if (containerRef.current) {
        containerRef.current.style.transform = `translate(0px, 0px)`;
      }
      return;
    }
    
    let theta = 0;
    let lastTime = performance.now();
    let isFinished = false;

    const loop = (timestamp: number) => {
      if (isFinished) {
        const frameToggle = Math.floor(timestamp / 300) % 2 === 0;
        if (stateRef.current === 'idle') {
          drawSprite(SPRITES.sit);
        } else {
          drawSprite(frameToggle ? SPRITES.wave : SPRITES.sit);
        }
        animationFrameId = requestAnimationFrame(loop);
        return;
      }

      const dt = (timestamp - lastTime) / 1000;
      lastTime = timestamp;
      theta += speed * dt;

      if (theta >= Math.PI * 2) {
        isFinished = true;
        setCatState('waving');
        setTimeout(() => setCatState('idle'), 3500);
        
        if (containerRef.current) {
          containerRef.current.style.transform = `translate(0px, 0px)`;
        }
        drawSprite(SPRITES.wave);
        animationFrameId = requestAnimationFrame(loop);
        return;
      }

      const x = Math.cos(theta) * radiusX;
      const y = Math.sin(theta) * radiusY;

      if (containerRef.current) {
        containerRef.current.style.transform = `translate(${centerX + x}px, ${centerY + y}px)`;
      }

      const dx = -Math.sin(theta) * radiusX;
      const dy = Math.cos(theta) * radiusY;

      let currentSprite;
      const frameToggle = Math.floor(timestamp / 120) % 2 === 0 ? 1 : 2;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) currentSprite = frameToggle === 1 ? SPRITES.right1 : SPRITES.right2;
        else currentSprite = frameToggle === 1 ? SPRITES.left1 : SPRITES.left2;
      } else {
        if (dy > 0) currentSprite = frameToggle === 1 ? SPRITES.down1 : SPRITES.down2;
        else currentSprite = frameToggle === 1 ? SPRITES.up1 : SPRITES.up2;
      }

      drawSprite(currentSprite);
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [animKey]);

  return (
    <div className="absolute -top-4 left-4 lg:left-8 z-20 flex items-center gap-3">
      <img src="/kitotext.png" alt="Kito" className="h-28 object-contain" style={{ marginRight: '-30px' }} />
      <div className="relative flex items-center" style={{ width: 45, height: 45 }}>
        <svg width="0" height="0" className="absolute pointer-events-none">
          <filter id="pinkTint">
            <feColorMatrix type="matrix" values="
              1 0 0 0 0
              0 0.6 0 0 0
              0 0 0.8 0 0
              0 0 0 1 0
            " />
          </filter>
        </svg>
        <div 
          ref={containerRef} 
          onClick={() => {
            if (catState !== 'running') {
              setCatState('running');
              setAnimKey(k=>k+1);
            }
          }} 
          className="absolute flex items-center cursor-pointer select-none" 
          style={{ top: 0, left: 0, zIndex: 20 }}
        >
          <img 
            ref={imgRef} 
            src={SPRITES.right1}
            width={45} 
            height={45} 
            style={{ imageRendering: 'pixelated', pointerEvents: 'none' }} 
            alt="Neko"
          />
          <motion.div
            className="absolute top-0 left-0"
            style={{ pointerEvents: 'none', filter: 'url(#pinkTint)' }} 
            initial={{ opacity: 0 }}
            animate={{ opacity: catState === 'waving' ? 1 : 0 }}
            transition={{ duration: 2 }}
          >
            <img 
              ref={pinkImgRef}
              src={SPRITES.right1}
              width={45} 
              height={45} 
              style={{ imageRendering: 'pixelated' }} 
              alt="Neko Pink Blush"
            />
          </motion.div>
          
          {catState === 'waving' && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, x: -5 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              transition={{ type: 'spring', bounce: 0.4, duration: 0.5, delay: 0.4 }}
              className="absolute left-full px-3 py-1.5 rounded-sm text-sm select-none flex items-center font-serif italic tracking-wide"
              style={{
                transformOrigin: 'left center',
                top: 0,
                background: '#fdf5e6',
                border: '1px solid #4a3b2c',
                color: '#4a3b2c',
                boxShadow: '2px 2px 0px rgba(74, 59, 44, 0.2)',
                marginLeft: 12,
                whiteSpace: 'nowrap',
                zIndex: 30
              }}
            >
              <div
                className="absolute"
                style={{
                  left: -5,
                  top: '50%',
                  transform: 'translateY(-50%) rotate(45deg)',
                  width: 8,
                  height: 8,
                  background: '#fdf5e6',
                  borderLeft: '1px solid #4a3b2c',
                  borderBottom: '1px solid #4a3b2c',
                }}
              />
              hey beautiful
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

const kittenColors = ['#FF6B9D', '#9B59B6', '#3498DB', '#F39C12', '#2ECC71'];

function App() {
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const session = params.get('session');
    if (session) return session;
    const newSession = Math.random().toString(36).substring(7);
    window.history.replaceState(null, '', `?session=${newSession}`);
    return newSession;
  });

  const [hasJoined, setHasJoined] = useState(false);
  const [localUser, setLocalUser] = useState(() => ({
    name: '',
    color: kittenColors[Math.floor(Math.random() * kittenColors.length)],
  }));

  const [users, setUsers] = useState<User[]>([]);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [particleMode, setParticleMode] = useState<ParticleMode>('default');

  const playerRef = useRef<YouTubePlayer | null>(null);
  const currentSong = queue[currentIndex];

  useEffect(() => {
    if (!hasJoined) return;
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        if (playerRef.current) {
          setCurrentTime(playerRef.current.getCurrentTime() || 0);
          setDuration(playerRef.current.getDuration() || 0);
        }
      }, 1000);
    } else {
      // One-off sync when paused to ensure time is correct
      if (playerRef.current) {
        setCurrentTime(playerRef.current.getCurrentTime() || 0);
        setDuration(playerRef.current.getDuration() || 0);
      }
    }
    return () => clearInterval(interval);
  }, [isPlaying, hasJoined]);

  useEffect(() => {
    if (!hasJoined) return;
    socket.connect();

    socket.emit('join-room', { roomId: sessionId, user: localUser });

    socket.on('room-state', (state) => {
      setQueue(state.queue);
      setCurrentIndex(state.currentIndex);
      setIsPlaying(state.isPlaying);
      setUsers(state.users);
      if (playerRef.current && state.currentTime) {
        playerRef.current.seekTo(state.currentTime);
      }
      if (state.isPlaying && playerRef.current) {
        playerRef.current.playVideo();
      }
    });

    socket.on('users-updated', (updatedUsers) => {
      setUsers(updatedUsers);
    });

    socket.on('queue-updated', ({ queue: newQ, currentIndex: newIdx }) => {
      setQueue(newQ);
      if (newIdx !== undefined) setCurrentIndex(newIdx);
    });

    socket.on('play', () => {
      setIsPlaying(true);
      if (playerRef.current) playerRef.current.playVideo();
    });

    socket.on('pause', () => {
      setIsPlaying(false);
      if (playerRef.current) playerRef.current.pauseVideo();
    });

    socket.on('state-synced', (state) => {
      if (state.currentIndex !== undefined) setCurrentIndex(state.currentIndex);
      if (state.isPlaying !== undefined) {
        setIsPlaying(state.isPlaying);
        if (playerRef.current) {
          state.isPlaying ? playerRef.current.playVideo() : playerRef.current.pauseVideo();
        }
      }
      if (state.currentTime !== undefined && playerRef.current) {
        // avoid stuttering if within 2 seconds
        const currentRefTime = playerRef.current.getCurrentTime();
        if (Math.abs(currentRefTime - state.currentTime) > 2) {
          playerRef.current.seekTo(state.currentTime);
          setCurrentTime(state.currentTime);
        }
      }
    });

    return () => {
      socket.off('room-state');
      socket.off('users-updated');
      socket.off('queue-updated');
      socket.off('play');
      socket.off('pause');
      socket.off('state-synced');
      socket.disconnect();
    };
  }, [sessionId, localUser, hasJoined]);

  useEffect(() => {
    if ('mediaSession' in navigator && currentSong) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: 'Kito Session',
        artwork: [
          { src: currentSong.thumbnail, sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        if (playerRef.current) {
          playerRef.current.playVideo();
          setIsPlaying(true);
          socket.emit('play', { roomId: sessionId });
        }
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        if (playerRef.current) {
          playerRef.current.pauseVideo();
          setIsPlaying(false);
          socket.emit('pause', { roomId: sessionId });
        }
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        if (currentIndex > 0) {
          const newIndex = currentIndex - 1;
          setCurrentIndex(newIndex);
          socket.emit('sync-state', { roomId: sessionId, currentIndex: newIndex, isPlaying: true, currentTime: 0 });
        }
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        if (currentIndex < queue.length - 1) {
          const newIndex = currentIndex + 1;
          setCurrentIndex(newIndex);
          socket.emit('sync-state', { roomId: sessionId, currentIndex: newIndex, isPlaying: true, currentTime: 0 });
        }
      });
    }
  }, [currentSong, currentIndex, queue.length, sessionId]);

  const handleAddToQueue = (song: Song) => {
    const newSong = { ...song, instanceId: Math.random().toString(36).substring(2, 9) };
    const newQueue = [...queue, newSong];
    setQueue(newQueue);
    socket.emit('update-queue', { roomId: sessionId, queue: newQueue, currentIndex });
  };

  const handlePlayNow = (song: Song) => {
    const newSong = { ...song, instanceId: Math.random().toString(36).substring(2, 9) };
    const newQueue = [...queue, newSong];
    const newIndex = newQueue.length - 1;
    setQueue(newQueue);
    setCurrentIndex(newIndex);
    setIsPlaying(true);
    socket.emit('update-queue', { roomId: sessionId, queue: newQueue, currentIndex: newIndex });
    socket.emit('sync-state', { roomId: sessionId, currentIndex: newIndex, isPlaying: true, currentTime: 0 });
  };

  const handleRemoveFromQueue = (index: number) => {
    const newQueue = queue.filter((_, i) => i !== index);
    setQueue(newQueue);
    let newIndex = currentIndex;
    if (index < currentIndex) {
      newIndex = currentIndex - 1;
    } else if (index === currentIndex && newQueue.length > 0) {
      if (currentIndex >= newQueue.length) newIndex = newQueue.length - 1;
    }
    setCurrentIndex(newIndex);
    socket.emit('update-queue', { roomId: sessionId, queue: newQueue, currentIndex: newIndex });
  };

  const handleReorderQueue = (newQueue: Song[]) => {
    // Find the current song using its instanceId or object reference
    const currentSong = queue[currentIndex];
    
    // Find its new index
    let newCurrentIndex = currentIndex;
    if (currentSong) {
      const idx = newQueue.findIndex(
        (s) => s.instanceId === currentSong.instanceId || s === currentSong
      );
      if (idx !== -1) newCurrentIndex = idx;
    }

    setQueue(newQueue);
    setCurrentIndex(newCurrentIndex);
    socket.emit('update-queue', { roomId: sessionId, queue: newQueue, currentIndex: newCurrentIndex });
  };

  const handlePlay = () => {
    if (playerRef.current) {
      playerRef.current.playVideo();
      setIsPlaying(true);
      socket.emit('play', { roomId: sessionId });
      socket.emit('sync-state', { roomId: sessionId, isPlaying: true, currentTime: playerRef.current.getCurrentTime() });
    }
  };

  const handlePause = () => {
    if (playerRef.current) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
      socket.emit('pause', { roomId: sessionId });
      socket.emit('sync-state', { roomId: sessionId, isPlaying: false, currentTime: playerRef.current.getCurrentTime() });
    }
  };

  const handleNext = () => {
    if (currentIndex < queue.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      socket.emit('sync-state', { roomId: sessionId, currentIndex: newIndex, isPlaying: true, currentTime: 0 });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      socket.emit('sync-state', { roomId: sessionId, currentIndex: newIndex, isPlaying: true, currentTime: 0 });
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
      socket.emit('sync-state', { roomId: sessionId, currentTime: time, isPlaying });
    }
  };

  const onPlayerReady = (event: { target: YouTubePlayer }) => {
    playerRef.current = event.target;
    playerRef.current.setVolume(volume);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (playerRef.current) {
      playerRef.current.setVolume(newVol);
    }
  };

  const onPlayerStateChange = (event: { data: number; target: YouTubePlayer }) => {
    if (event.data === 0) handleNext();
    else if (event.data === 1) {
      setIsPlaying(true);
      socket.emit('sync-state', { roomId: sessionId, isPlaying: true, currentTime: event.target.getCurrentTime() });
    }
    else if (event.data === 2) {
      setIsPlaying(false);
      socket.emit('sync-state', { roomId: sessionId, isPlaying: false, currentTime: event.target.getCurrentTime() });
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
    >
      {/* Dynamic Background Particles */}
      <BackgroundParticles isPlaying={isPlaying} mode={particleMode} />

      {/* Ambient orbs */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 600,
          height: 600,
          top: '-200px',
          left: '-100px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 500,
          height: 500,
          bottom: '-150px',
          right: '-100px',
          background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 400,
          height: 400,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Retro grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 90%)',
        }}
      />

      {!hasJoined ? (
        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <div 
            className="w-full max-w-md p-8 rounded-3xl flex flex-col items-center text-center shadow-2xl"
            style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.13)',
            }}
          >
            <div className="w-full h-20 z-20 relative flex items-center justify-center">
              <img 
                src="/kitotransaprent.png" 
                alt="Kito Logo" 
                className="w-52 h-52 object-contain absolute"
              />
            </div>
            <div className="relative w-80 h-20 overflow-hidden flex items-center justify-center mb-2 mt-4 z-10">
              <img 
                src="/jointheroom.png" 
                alt="Join the Room" 
                className="absolute w-80 object-contain" 
              />
            </div>
            <p className="text-white/60 font-mono text-sm mb-8 relative z-20">Enter your name to start co-listening.</p>
            
            <form 
              className="w-full flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (localUser.name.trim()) setHasJoined(true);
              }}
            >
              <input
                type="text"
                placeholder="Your Name"
                value={localUser.name}
                onChange={(e) => setLocalUser({ ...localUser, name: e.target.value })}
                className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all"
                autoFocus
              />
              <button
                type="submit"
                disabled={!localUser.name.trim()}
                className="w-full py-3 rounded-xl font-bold text-white tracking-wide transition-all disabled:opacity-50 hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #4c1d95)',
                  boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
                }}
              >
                Let's Listen
              </button>
            </form>
          </div>
        </div>
      ) : (
        <>
          {/* Top-left: Welcome header */}
          <RetroNekoCat />

          {/* Main Layout */}
          <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center lg:items-center justify-center px-3 lg:px-6 pt-16 pb-4 lg:py-0 max-w-7xl mx-auto gap-4 lg:gap-8">
            
            {/* Mobile Session Toggle Button (Top Right) */}
            <button 
              className="lg:hidden absolute top-2 right-4 z-30 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff'
              }}
              onClick={() => setIsSessionOpen(true)}
            >
              <Users className="w-5 h-5" />
            </button>

            {/* Settings Button */}
            <button 
              className="absolute top-2 right-[72px] lg:top-6 lg:right-6 z-30 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff'
              }}
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className="w-full lg:w-auto flex justify-center lg:justify-end mt-2 lg:mt-0 order-2 lg:order-1">
              <SearchQueuePanel
                onAddToQueue={handleAddToQueue}
                onPlayNow={handlePlayNow}
              />
            </div>

            {/* Vinyl Player */}
            <div className="w-full lg:w-auto flex justify-center lg:justify-start mb-2 lg:mb-0 order-1 lg:order-2">
              <VinylPlayer
                isPlaying={isPlaying}
                currentSong={currentSong}
                volume={volume}
                currentTime={currentTime}
                duration={duration}
                onVolumeChange={handleVolumeChange}
                onSeek={handleSeek}
                onPlay={handlePlay}
                onPause={handlePause}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onOpenQueue={() => setIsQueueOpen(true)}
              />
            </div>

            {/* Right: Session (Desktop) */}
            <div className="hidden lg:flex w-full lg:w-auto justify-center lg:justify-start lg:mt-0 order-3">
              <SessionPanel sessionId={sessionId} users={users} isHost={true} />
            </div>
          </div>

          {/* Queue Bottom Sheet */}
          <QueueSheet
            isOpen={isQueueOpen}
            onClose={() => setIsQueueOpen(false)}
            queue={queue}
            currentIndex={currentIndex}
            onReorder={handleReorderQueue}
            onRemove={handleRemoveFromQueue}
            onPlay={(idx) => {
              setCurrentIndex(idx);
              socket.emit('sync-state', { roomId: sessionId, currentIndex: idx, isPlaying: true, currentTime: 0 });
            }}
          />

          {/* Session Overlay */}
          <AnimatePresence>
            {isSessionOpen && (
              <motion.div
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end"
                style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              >
                <div 
                  className="w-full p-6 pt-12 rounded-t-3xl relative flex flex-col items-center pb-12"
                  style={{
                    background: 'linear-gradient(135deg, #130a2e, #1a0a2e)',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <button 
                    className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    onClick={() => setIsSessionOpen(false)}
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <SessionPanel sessionId={sessionId} users={users} isHost={true} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pixel kittens — bottom-left corner */}
          <div className="fixed bottom-5 left-5 flex gap-3 items-end z-20">
            {users.slice(0, 5).map((user, index) => (
              <PixelKitten
                key={user.id}
                color={kittenColors[index % kittenColors.length]}
                isBopping={isPlaying}
                name={user.name}
              />
            ))}
          </div>

          {/* Hidden YouTube Player */}
          {currentSong && (
            <div className="hidden">
              <YouTube
                videoId={currentSong.id}
                opts={{ playerVars: { autoplay: 1, playsinline: 1 } }}
                onReady={onPlayerReady}
                onStateChange={onPlayerStateChange}
              />
            </div>
          )}

          {/* Settings Modal */}
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            particleMode={particleMode}
            setParticleMode={setParticleMode}
          />
        </>
      )}

      <Toaster position="top-right" />
    </div>
  );
}

export default App;
