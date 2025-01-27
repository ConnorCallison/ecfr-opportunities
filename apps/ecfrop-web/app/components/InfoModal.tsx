import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    How to Interpret Scores
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      General Scoring
                    </h4>
                    <p className="text-sm text-gray-600">
                      Most scores range from 1 to 100, where:
                      <br />• 1 = Minimal impact/complexity
                      <br />• 100 = Extreme impact/complexity
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Score Categories
                    </h4>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>
                        <strong>Complexity Score:</strong> Measures how complex
                        and difficult the regulation is to understand and
                        implement.
                      </p>
                      <p>
                        <strong>Business Cost Score:</strong> Indicates the
                        financial burden on businesses to comply with the
                        regulation.
                      </p>
                      <p>
                        <strong>Market Impact Score:</strong> Reflects how
                        significantly the regulation affects market dynamics and
                        competition.
                      </p>
                      <p>
                        <strong>Administrative Cost Score:</strong> Shows the
                        burden on government agencies to implement and enforce
                        the regulation.
                      </p>
                      <p>
                        <strong>DEI Score:</strong> Unique scale where:
                        <br />• 100: Purely merit-based, focusing on
                        qualifications and objective criteria
                        <br />• 75-99: Mostly merit-based with some
                        consideration of broader access
                        <br />• 50-74: Mixed approach with both merit and
                        identity considerations
                        <br />• 25-49: Significant identity-based considerations
                        <br />• 1-24: Heavily identity-based with minimal focus
                        on merit
                      </p>
                      <p>
                        <strong>Automation Potential:</strong> Indicates how
                        easily the regulation's requirements could be automated,
                        where higher scores mean greater automation potential.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Color Coding
                    </h4>
                    <p className="text-sm text-gray-600">
                      For most metrics (except DEI):
                      <br />• Green: Low impact (1-20)
                      <br />• Yellow: Moderate impact (21-40)
                      <br />• Orange: High impact (41-60)
                      <br />• Red: Very high impact (61-100)
                      <br />
                      <br />
                      For DEI scores, the color scale is reversed to reflect
                      that higher (merit-based) scores are preferred.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Got it
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
