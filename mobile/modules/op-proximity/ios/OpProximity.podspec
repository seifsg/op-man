Pod::Spec.new do |s|
  s.name           = 'OpProximity'
  s.version        = '1.0.0'
  s.summary        = 'Proximity sensor near/far events for OP Man push-up counting'
  s.description    = 'Streams UIDevice proximity state changes to JS while observed.'
  s.author         = 'Seif'
  s.homepage       = 'https://github.com/seifsg/op-man'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
